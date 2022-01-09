const driver = require("../neo4jdriver");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const storage = require("../storage");
const { int } = require("neo4j-driver");

const session = driver.session();

//registracija
router.post(
    "/register",
    multer({ storage: storage }).single("image"),
    async(req, res) => {
        if (
            req.body.firstName == null ||
            req.body.lastName == null ||
            req.body.email == null ||
            req.body.username == null ||
            req.body.password == null
        )
            return res
                .status(409)
                .send("Niste uneli validne podatke, proverite ponovo.");

        const hashPassword = await bcrypt.hash(req.body.password, 12);
        const userFirstName =
            req.body.firstName.charAt(0).toUpperCase() + req.body.firstName.slice(1);
        const userLastName =
            req.body.lastName.charAt(0).toUpperCase() + req.body.lastName.slice(1);
        const url = req.protocol + "://" + req.get("host");
        let imgPath = url + "/images/";
        if (req.file) imgPath += req.file.filename;
        else imgPath += "universal.jpg";

        try {
            let cypher = `CREATE (a:User {firstName: $firstName,
          lastName: $lastName,
          email: $email,
          username: $username,
          password: $password,
          image: $image,
          friendsNo: 0,
          followedLocationsNo: 0,
          postsNo: 0`;
            const params = {
                firstName: userFirstName,
                lastName: userLastName,
                email: req.body.email,
                username: req.body.username,
                password: hashPassword,
                image: imgPath,
            };

            if (req.body.bio && req.body.bio != "") {
                cypher += ", bio: $bio";
                params.bio = req.body.bio;
            }
            cypher += "})";
            await session.run(cypher, params);

            return res.send("Uspesno registrovan");
        } catch (ex) {
            console.log(ex);
            if (ex.message.includes("email"))
                return res
                    .status(409)
                    .send("Postoji nalog sa ovom e-mail adresom, probajte ponovo.");
            else
                return res
                    .status(409)
                    .send("Postoji nalog sa ovim username-om, probajte ponovo");
        }
    }
);

//logovanje
router.post("/login", async(req, res) => {
    try {
        const result = await session.run(
            "MATCH (u:User) WHERE u.username=$username RETURN u.password, id(u)", { username: req.body.username }
        );
        if (result.records.length == 0)
            return res.status(401).send("Greška pri logovanju, pokušajte ponovo."); //ne postoji nalog sa ovim username-om

        const userPassword = result.records[0].get(0);
        const userId = result.records[0].get(1).low;
        const isCorrect = await bcrypt.compare(req.body.password, userPassword);

        if (isCorrect) {
            const token = jwt.sign({
                    username: req.body.username,
                    id: userId,
                },
                "token", { expiresIn: "1h" }
            );
            return res.send({
                id: userId,
                username: req.body.username,
                token: token,
                expiration: 60,
            });
        } else
            return res.status(401).send("Greška pri logovanju, pokušajte ponovo.");
    } catch {
        return res.status(401).send("Greška pri logovanju, pokušajte ponovo.");
    }
});

//promena slike, username-a, lozinke, opisa profila
router.patch(
    "/:id",
    multer({ storage: storage }).single("image"),
    async(req, res) => {
        try {
            let chyper = "";
            const params = new Object();
            params.id = int(req.params.id);

            if (req.body.image) {
                params.username = req.body.image;
                chyper = "u.image = $image";
            }
            if (req.body.username) {
                if (chyper) chyper += ", ";
                chyper += "u.username = $username";
                params.username = req.body.username;
            }

            if (req.body.password && req.body.newPassword) {
                const result = await session.run(
                    "MATCH (u:User) WHERE id(u)=$id RETURN u.password", { id: int(req.params.id) }
                );
                const isValid = await bcrypt.compare(
                    req.body.password,
                    result.records[0].get(0)
                );
                if (isValid) {
                    const hashPassword = await bcrypt.hash(req.body.newPassword, 12);
                    if (chyper) chyper += ", ";
                    chyper += "u.password = $password";
                    params.password = hashPassword;
                } else
                    return res
                        .status(305)
                        .send(
                            "Uneta password se ne poklapa sa trenutnom lozinkom, proverite unete podatke."
                        );
            }

            if (req.body.bio) {
                if (chyper) chyper += ", ";
                chyper += "u.bio = $bio";
                params.bio = req.body.bio;
            }
            if (req.file) {
                const url = req.protocol + "://" + req.get("host");
                let imgPath = url + "/images/" + req.file.filename;
                if (chyper) chyper += ", ";
                chyper += "u.image = $image";
                params.image = imgPath;
            }
            await session.run("MATCH (u:User) WHERE id(u)=$id SET " + chyper, params);
            return res.send("Ažuriranje podataka je uspešno.");
        } catch (ex) {
            if (ex.message.includes("username"))
                return res
                    .status(409)
                    .send("Postoji nalog sa ovim username-om, probajte ponovo.");
            return (
                res.status(409),
                send("Doslo je do greške prilikom ažuriranja, pokušajte ponovo.")
            );
        }
    }
);


//pribavljanje informacija o korisniku (prijatelju ili nekom drugom korisniku), za prikazivanje pocetne strane
router.get("/profile/:loggedID/:profileUser/:limit", async(req, res) => {

    const cypher = `MATCH (otherU:User) WHERE otherU.username=$profileUser CALL {WITH otherU OPTIONAL MATCH (loc:Location)
        <-[:LOCATED_AT]-(post:Post)<-[:SHARED]-(otherU:User)
        <-[:IS_FRIEND]-(logU:User) WHERE otherU.username=$profileUser and id(logU)=$loggedID WITH post, loc ORDER BY post.time DESC
        LIMIT $limit
        RETURN collect({post:post, loc: {id:id(loc), country:loc.country, city:loc.city}}) as posts} RETURN id(otherU), otherU.firstName, 
        otherU.lastName, otherU.username, otherU.image, otherU.email, otherU.bio,
        otherU.followedLocationsNo, otherU.friendsNo, otherU.postsNo, posts`;
    
    try{
        const result = await session.run(cypher, {profileUser: req.params.profileUser, loggedID: int(req.params.loggedID), limit: int(req.params.limit)});

        const parsedRes = {
            id: result.records[0].get("id(otherU)").low,
            firstName: result.records[0].get(1),
            lastName: result.records[0].get(2),
            username: result.records[0].get(3),
            image: result.records[0].get(4),
            email: result.records[0].get(5),
            bio: result.records[0].get(6),
            followedLocationsNo: result.records[0].get(7).low,
            friendsNo: result.records[0].get(8).low,
            postsNo: result.records[0].get(9).low,
            posts: null
        }

        const posts = result.records[0].get(10);

        if (posts != null){
            let parsedPosts = posts.map((postWithLoc) => {
                if (postWithLoc.post != null){
                    return {
                        id: postWithLoc.post.identity.low,
                        commentNo: postWithLoc.post.properties.commentNo.low,
                        likeNo: postWithLoc.post.properties.likeNo.low,
                        description: postWithLoc.post.properties.description,
                        time: postWithLoc.post.properties.time,
                        location: {
                            id: postWithLoc.loc.id.low,
                            country: postWithLoc.loc.country,
                            city: postWithLoc.loc.city
                        }
                    }
                }
            });
            if (posts.length == 1 && posts[0].post == null){
                parsedRes.posts = null;
            } else {
                parsedRes.posts = parsedPosts;
            }
        }


        return res.status(200).send(parsedRes);
    }
    catch(err){
        console.log(err);
        return res.status(501).send("Doslo je do greske!");
    }
});



//pribavljanje informacija o profilu korisnika koji je ulogovan
router.get("/profile/:username", async(req, res) => {

    try{
        const cypher = `MATCH (u: User) WHERE u.username=$username CALL {WITH u MATCH (u:User)-[:SHARED]->(p: Post)-[:LOCATED_AT]->(loc:Location)
            WHERE u.username=$username
            WITH u, loc, p LIMIT 10 RETURN collect({post:p, loc:{id:id(loc), country: loc.country, city: loc.city}}) as posts}
            RETURN id(u), u.firstName, 
            u.lastName, u.username, u.image, u.email, u.bio,
            u.followedLocationsNo, u.friendsNo,u.postsNo, posts`;
        const result = await session.run(cypher, {username: req.params.username});

        const parsedRes = {
            id: result.records[0].get("id(u)").low,
            firstName: result.records[0].get(1),
            lastName: result.records[0].get(2),
            username: result.records[0].get(3),
            image: result.records[0].get(4),
            email: result.records[0].get(5),
            bio: result.records[0].get(6),
            followedLocationsNo: result.records[0].get(7).low,
            friendsNo: result.records[0].get(8).low,
            postsNo: result.records[0].get(9).low,
            posts: null
        };

        const posts = result.records[0].get(10);

        const parsedPosts = [];
        posts.forEach((postWithLoc) => {
            let parsedPost = {
                id: postWithLoc.post.identity.low,
                description: postWithLoc.post.properties.description,
                image: postWithLoc.post.properties.image,
                likeNo: postWithLoc.post.properties.likeNo.low,
                commentNo: postWithLoc.post.properties.commentNo.low,
                location: {
                    id: postWithLoc.loc.id.low,
                    country: postWithLoc.loc.country,
                    city: postWithLoc.loc.city
                }
            };
            parsedPosts.push(parsedPost);
        });
        parsedRes.posts = parsedPosts;

        return res.status(200).send(parsedRes);
    }
    catch(err){
        console.log(err);
        return res.status(501).send("Doslo je do greske!");
    }
});


module.exports = router;