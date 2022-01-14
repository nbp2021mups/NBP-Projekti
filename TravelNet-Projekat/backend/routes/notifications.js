const driver = require("../neo4jdriver");
const express = require("express");
const { int } = require("neo4j-driver");

const session = driver.session();
const router = express.Router();

// Routes
router.get("/:userId/:startIndex/:count", async(req, res) => {
    try {
        const cypher = `MATCH (u:User)-[:HAS]->(n:Notification)
                        WHERE id(u)=$userId
                        RETURN n
                        ORDER BY n.timeSent DESC
                        SKIP $startIndex
                        LIMIT $count`;
        const params = {
            userId: int(req.params.userId),
            startIndex: int(req.params.startIndex),
            count: int(req.params.count),
        };
        const result = await session.run(cypher, params);
        return res.send(
            result.records.map((x) => ({
                id: x.get("n").identity.low,
                ...x.get("n").properties,
                timeSent: new Date(x.get("n").properties.timeSent),
            }))
        );
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

router.delete("/:id", async(req, res) => {
    try {
        console.log(req.params.id);
        const cypher = `MATCH (n:Notification)
                WHERE id(n)=$id
                DETACH DELETE n`;
        await session.run(cypher, { id: int(req.params.id) });
        res.send({ msg: "Obrisano" });
    } catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;