const express = require("express");
const router = express.Router();

const driver = require("../neo4jdriver");
const { int } = require("neo4j-driver");
const session = driver.session();

const { getConnection } = require("../redisclient");

router.post("", async(req, res) => {
    try {
        const cypher = `MATCH (u:User), (p:Post)<-[:SHARED]-(toUser:User)
                      WHERE id(u) = $userId AND id(p) = $postId
                      SET p.likeNo=p.likeNo+1
                      MERGE (u)-[r:LIKED{time: $time}]->(p)
                      MERGE (toUser)-[:HAS]->(n:Notification{
                          from: u.username,
                          to: toUser.username,
                          timeSent: $time,
                          read: $read,
                          content: id(r),
                          type: 'post-like'
                      })
                      RETURN n`;
        const params = {
            userId: req.body.userId,
            postId: req.body.postId,
            time: new Date().toString(),
            read: false,
        };
        const result = await session.run(cypher, params);
        const notification = {
            id: result.records[0].get("n").identity.low,
            ...result.records[0].get("n").properties,
        };
        const redisClient = await getConnection();
        await redisClient.publish(
            "user-updates:" + notification.to,
            JSON.stringify({ type: "new-notification", payload: notification })
        );

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
                        WITH u, r, p
                        OPTIONAL MATCH (n:Notification)
                        WHERE n.content=id(r)
                        SET p.likeNo=p.likeNo-1
                        DELETE r
                        DETACH DELETE n`;
        const params = {
            userId: int(req.params.userId),
            postId: int(req.params.postId),
        };
        await session.run(cypher, params);
        return res.send("Lajk obrisan uspesno");
    } catch (ex) {
        console.log(ex);
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
            count: 20 || int(req.params.count),
        };
        const result = await session.run(cypher, params);
        const rez = {
            posts: result.records.map((x) => ({
                id: x.get("p").identity.low,
                ...x.get("p").properties,
            })),
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
            count: int(req.params.count),
        };
        const result = await session.run(cypher, params);
        const rez = {
            users: result.records.map((x) => ({
                id: x.get("u").identity.low,
                ...x.get("u").properties,
            })),
        };
        return res.send(rez);
    } catch (ex) {
        console.log(ex);
        res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;