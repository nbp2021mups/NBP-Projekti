const driver = require('../neo4jdriver');
const express = require("express");
const router = express.Router();

const session = driver.session();

router.post("", async(req, res) => {
    try {
        const cypher = 'MATCH (u:User), (p:Post) WHERE id(u)=$userId AND id(p)=$postId MERGE (u)-[r:COMMENTED{comment: $comment}]->(p)'
        const params = { userId: req.body.userId, postId: req.body.postId, comment: req.body.comment }
        await session.run(cypher, params);
        return res.send("comment postavljen uspesno");
    } catch (ex) {
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }
});

// Vracanje poslednjih 20 komenata objave
router.get("/:postId", async(req, res) => {
    try {
        const cypher = `MATCH (u:User)-[r:COMMENTED]->(p:Post)
                        WHERE id(p)=$postId 
                        RETURN r, u
                        ORDER BY r.time DESC
                        LIMIT 20`;
        const params = { postId: parseInt(req.params.postId) };
        const result = await session.run(cypher, params);
        return res.send({
            comments: result.records.map(c => ({
                id: c.get("r").identity.low,
                username: c.get("u").properties.username,
                ...c.get("r").properties
            }))
        });
    } catch (ex) {
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;