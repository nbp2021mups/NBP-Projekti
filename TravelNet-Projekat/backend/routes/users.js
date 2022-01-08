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

module.exports = router;