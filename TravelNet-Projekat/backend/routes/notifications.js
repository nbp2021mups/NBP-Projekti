const driver = require("../neo4jdriver");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const storage = require("../storage");
const { int } = require("neo4j-driver");

const session = driver.session();
const router = express.Router();

// Routes
router.get("/:userId/:startIndex/:count", async(req, res) => {
    try {
        const cypher = `MATCH (u:User)-[:HAS]->(n:Notification)
                        WHERE id(u)=$userId
                        RETURN n
                        ORDER BY n.timeSent
                        SKIP $startIndex
                        LIMIT $count`;
        const params = {
            userId: int(req.params.userId),
            startIndex: int(startIndex),
            count: int(count),
        };
        const result = await session.run(cypher, params);
        res.send({
            notifications: result.records.map((x) => ({
                id: x.get("identity").low,
                ...x.get("n"),
            })),
        });
    } catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});

router.post("/", async(req, res) => {
    try {} catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});

router.put("/", async(req, res) => {
    try {} catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});

router.patch("/", async(req, res) => {
    try {} catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});

router.delete("/", async(req, res) => {
    try {} catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;