const express = require("express");
const router = express.Router();

const driver = require('../neo4jdriver');
const { int } = require('neo4j-driver');
const session = driver.session();

const {getConnection} = require('../redisclient');


router.post("", async(req, res) => {
    try {
        const cypher = `MATCH (u:User), (p:Post)<-[:SHARED]-(toUser:User)
                      WHERE id(u) = $userId AND id(p) = $postId
                      SET p.likeNo=p.likeNo+1
                      MERGE (u)-[r:LIKED{time: $time}]->(p)
                      RETURN u.username, toUser.username`;
        const params = {
            userId: req.body.userId,
            postId: req.body.postId,
            time: new Date().toString()
        };
        const result=await session.run(cypher, params);
        const from=result.records[0].get('u.username');
        const to= result.records[0].get('toUser.username');
        console.log("from",from,"to",to)
        getConnection().then(redisClient=>redisClient.publish("post-like:" + to, JSON.stringify({
          id: 0,
          from: from,
          to: to,
          type: "post-like",
          content: req.body.postId,
          timeSent: new Date()
          })));

        return res.send("Lajk!");
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }
});

router.delete("/:userId/:postId", async(req, res) => {
    try {
        const cypher = `MATCH (u:User)-[r:LIKED]-(p:Post)
                        WHERE id(u)=$userId AND id(p)=$postId
                        SET p.likeNo=p.likeNo-1
                        DELETE r`;
        const params = {
            userId: int(req.params.userId),
            postId: int(req.params.postId)
        };
        await session.run(cypher, params);
        return res.send("Lajk obrisan uspesno");
    } catch (ex) {
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }
});

// Vracanje opsega postova koje je korisnik lajkovao
router.get("/user/:username/:startIndex/:count", async(req, res) => {
    try {
        const cypher = `MATCH (u:User { username: $username })-[r:LIKED]->(p:Post)
                        RETURN p
                        ORDER BY r.time DESC
                        SKIP $startIndex
                        LIMIT $count`;
        const params = {
            username: req.params.username,
            startIndex: 0 || int(req.params.startIndex),
            count: 20 || int(req.params.count)
        };
        const result = await session.run(cypher, params);
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

// Vracanje opsega korisnika koji su lajkovali objavu
router.get("/post/:postId/:startIndex/:count", async(req, res) => {
    try {
        const cypher = `MATCH (u:User)-[r:LIKED]->(p:Post)
                      WHERE id(p) = $postId
                      RETURN u
                      ORDER BY r.time DESC
                      SKIP $startIndex
                      LIMIT $count`;
        const params = {
            postId: int(req.params.postId),
            startIndex: int(req.params.startIndex),
            count: int(req.params.count)
        };
        console.log(params)
        const result = await session.run(cypher, params);
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
