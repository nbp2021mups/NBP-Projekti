const driver = require('../neo4jdriver');
const express = require("express");
const router = express.Router();

const session = driver.session();


router.post("", async(req, res) => {
    try {
        const cypher = `MATCH (u:User), (p:Post)
                      WHERE id(u) = $userId AND id(p) = $postId
                      MERGE (u)-[r:LIKED{time: $time}]->(p)`;
        const params = {
            userId: req.body.userId,
            postId: req.body.postId,
            time: new Date().toString()
        };
        await session.run(cypher, params);
        return res.send("Lajk!");
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }
});

router.delete("/:userId/:postId", async(req, res) => {
    try {
        const cypher = `MATCH (u:User)-[r:LIKED]-(p:Post)
                        WHERE id(u)=$userId AND id(l)=$postId
                        DELETE r`;
        const params = {
            id: parseInt(req.params.likeId),
            locationId: parseInt(req.params.locationId)
        };
        await session.run(cypher, params);
        return res.send("Lajk obrisan uspesno");
    } catch (ex) {
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }
});

// Vracanje poslednjih 20 postova koje je user lajkovao
router.get("/user/:username", async(req, res) => {
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

// Vracanje poslednjih 20 korisnika koji su lajkovali objavu
router.get("/post/:postId", async(req, res) => {
    try {
        const cypher = `MATCH (u:User)-[r:LIKED]->(p:Post)
                      WHERE id(p) = $postId
                      RETURN u
                      ORDER BY r.time DESC
                      LIMIT 20`;
        const result = await session.run(cypher, { postId: parseInt(req.params.postId) });
        const rez = {
            users: result.records.map(x => ({
                id: x.get("u").identity.low,
                ...x.get("u").properties
            }))
        };
        res.send(rez);
    } catch (ex) {
        console.log(ex);
        res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;