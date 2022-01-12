const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const storage = require("../storage");
const fs = require("fs");

const { int } = require("neo4j-driver");
const driver = require("../neo4jdriver");
const session = driver.session();

const redis = require("../redisclient");

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
            fs.unlink(req.file.path, (err) => {
                if (err)
                    return res
                        .status(409)
                        .send("Niste uneli validne podatke, proverite ponovo.");
            });
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

            /*  const chyper=`MATCH (l:Location)<-[:FOLLOWS]-(u:User)
                                                                                                                                                              WHERE u.username=$username
                                                                                                                                                              RETURN ID(l)`

                                                                                                                                                const locations=await session.run(chyper, {username:req.body.username})
                                                                                                                                                console.log(locations.records.length)
                                                                                                                                                if(locations.records.length>0){
                                                                                                                                                  const subscriber = await redis.getDuplicatedClient()
                                                                                                                                                  locations.records.forEach(record=>{
                                                                                                                                                    subscriber.subscribe("location:"+record.get('ID(l)').low, (message, channel)=>{
                                                                                                                                                      console.log("Message: " + message + "on channel " + channel);
                                                                                                                                                    })
                                                                                                                                                  })
                                                                                                                                                  console.log("users", subscriber)

                                                                                                                                                } */

            return res.send({
                id: userId,
                username: req.body.username,
                token: token,
                expiration: 60,
            });
        } else
            return res.status(401).send("Greška pri logovanju, pokušajte ponovo.");
    } catch (ex) {
        console.log(ex);
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
router.get("/profile/:loggedUser/:profileUser/:limit", async(req, res) => {
    try {
        const cypher = `MATCH(otherU:User{username:$otherU})
                OPTIONAL MATCH(otherU:User)-[link]-(logU:User{username:$logU})
                RETURN id(otherU), otherU.firstName,
                otherU.lastName, otherU.username, otherU.image, otherU.email, otherU.bio,
                otherU.followedLocationsNo, otherU.friendsNo, otherU.postsNo, startNode(link).username, type(link)`;
        const params = {
            otherU: req.params.profileUser,
            logU: req.params.loggedUser,
        };

        const userResult = await session.run(cypher, params);
        const link = userResult.records[0].get(11);
        let parsedPosts = null;
        let relation = null;

        if (link != null && link == "IS_FRIEND") {
            relation = "friend";
            parsedPosts = [];
            const cypher = `MATCH(otherU:User{username: $otherU})
            OPTIONAL MATCH(otherU:User)-[s:SHARED]->(post:Post)-[:LOCATED_AT]->(loc:Location)
            WITH s, post, loc
            ORDER BY s.time DESC
            LIMIT $limit
            CALL {
                WITH post
                OPTIONAL MATCH(logU: User{username: $logU})-[l:LIKED]->(post:Post)
                RETURN count(l) as like
            }
            RETURN collect({post:post, time: s.time, like: like, loc: {id:id(loc), country:loc.country,city:loc.city}}) as posts`;

            const params = {
                otherU: req.params.profileUser,
                logU: req.params.loggedUser,
                limit: int(req.params.limit),
            };

            const postResult = await session.run(cypher, params);
            const posts = postResult.records[0].get(0);
            posts.forEach((postWithLoc) => {
                if (postWithLoc.post != null) {
                    let parsedPost = {
                        id: postWithLoc.post.identity.low,
                        image: postWithLoc.post.properties.image,
                        commentNo: postWithLoc.post.properties.commentNo.low,
                        likeNo: postWithLoc.post.properties.likeNo.low,
                        description: postWithLoc.post.properties.description,
                        time: postWithLoc.post.properties.time,
                        like: postWithLoc.like == 0 ? false : true,
                        location: {
                            id: postWithLoc.loc.id.low,
                            country: postWithLoc.loc.country,
                            city: postWithLoc.loc.city,
                        },
                    };
                    parsedPosts.push(parsedPost);
                }
            });
        }

        if (relation == null && link != null) {
            const startNode = userResult.records[0].get(10);
            if (startNode == req.params.profileUser) {
                relation = "rec_req";
            } else if (startNode == req.params.loggedUser) {
                relation = "sent_req";
            }
        }

        const parsedRes = {
            id: userResult.records[0].get("id(otherU)").low,
            firstName: userResult.records[0].get(1),
            lastName: userResult.records[0].get(2),
            username: userResult.records[0].get(3),
            image: userResult.records[0].get(4),
            email: userResult.records[0].get(5),
            bio: userResult.records[0].get(6),
            followedLocationsNo: userResult.records[0].get(7).low,
            friendsNo: userResult.records[0].get(8).low,
            postsNo: userResult.records[0].get(9).low,
            relation: relation,
            posts: parsedPosts,
        };

        return res.send(parsedRes);
    } catch (err) {
        console.log(err);
        return res.status(501).send("Doslo je do greske!");
    }
});

//pribavljanje informacija o profilu korisnika koji je ulogovan
router.get("/profile/:username", async(req, res) => {
    try {
        const cypher = `MATCH (u: User) WHERE u.username=$username CALL {WITH u MATCH (u:User)-[:SHARED]->(p: Post)-[:LOCATED_AT]->(loc:Location)
            WHERE u.username=$username
            WITH u, loc, p LIMIT 10 RETURN collect({post:p, loc:{id:id(loc), country: loc.country, city: loc.city}}) as posts}
            RETURN id(u), u.firstName,
            u.lastName, u.username, u.image, u.email, u.bio,
            u.followedLocationsNo, u.friendsNo,u.postsNo, posts`;
        const result = await session.run(cypher, { username: req.params.username });

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
            posts: null,
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
                    city: postWithLoc.loc.city,
                },
            };
            parsedPosts.push(parsedPost);
        });
        parsedRes.posts = parsedPosts;

        return res.status(200).send(parsedRes);
    } catch (err) {
        console.log(err);
        return res.status(501).send("Doslo je do greske!");
    }
});

router.get("/light/:username", async(req, res) => {
    try {
        const cypher = `MATCH (u: User {username:$username})
            RETURN u.firstName,
            u.lastName, u.username, u.image`;
        const result = await session.run(cypher, { username: req.params.username });

        const parsedRes = {
            firstName: result.records[0].get(0),
            lastName: result.records[0].get(1),
            username: result.records[0].get(2),
            image: result.records[0].get(3),
        };

        return res.status(200).send(parsedRes);
    } catch (err) {
        console.log(err);
        return res.status(501).send("Došlo je do greske!");
    }
});

router.get("/conversations/:userId/:startIndex/:count", async(req, res) => {
    try {
        const cypher = `MATCH (u1: User)-[r1:HAS]->(c:Chat)<-[r2:HAS]-(u2: User)
                        WHERE id(u1) = $userId
                        WITH c, u2
                        RETURN u2.username, u2.image, c
                        ORDER BY c.topMessageTimeSent DESC
                        SKIP $startIndex
                        LIMIT $count`;
        const params = {
            userId: int(req.params.userId),
            startIndex: int(req.params.startIndex),
            count: int(req.params.count),
        };
        const result = await session.run(cypher, params);
        const parsedRes = result.records.map((x) => ({
            friendUsername: x.get(0),
            friendImage: x.get(1),
            id: x.get(2).identity.low,
            ...x.get(2).properties,
        }));

        return res.status(200).send(parsedRes);
    } catch (err) {
        console.log(err);
        return res.status(501).send("Došlo je do greske!");
    }
});

module.exports = router;