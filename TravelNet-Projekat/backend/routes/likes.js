const driver = require('../neo4jdriver');
const express = require("express");
const router = express.Router();

const session = driver.session();


router.post("", async(req, res) => {
    try {
        const cypher = 'MATCH (u:User), (p:Post) WHERE id(u) = $userId AND id(p) = $postId MERGE (u)-[r:LIKED]->(p)'
        const params = { userId: req.body.userId, postId: req.body.postId }
        await session.run(cypher, params);
        return res.send("Lajk!");
    } catch (ex) {
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }
})

router.delete("/:likeId", async(req, res) => {
    try {
        const cypher = 'MATCH ()-[r]-() WHERE id(r)=$id DELETE r'
        const params = { id: parseInt(req.params.likeId) }
        await session.run(cypher, params);
        return res.send("Lajk obrisan uspesno");
    } catch (ex) {
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }
});

// Vracanje poslednjih 20 postova koje je user lajkovao
router.get("/:username", async(req, res) => {
    try {
        const cypher = `MATCH (u:User { username: $username })-[r:LIKED]->(p:Post)
                        RETURN p
                        ORDER BY r.time DESC
                        LIMIT 20`;
        const result = await session.run(cypher, { username: req.params.username });
        const rez = {
            posts: result.records.map(x => ({
                id: x.get("p").identity.low,
                ...x.get("p").properties
            }))
        };
        res.send(rez);
    } catch (ex) {
        console.log(ex);
        res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;