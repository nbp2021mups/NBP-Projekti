const express = require("express");
const router = express.Router();

const { int } = require("neo4j-driver");
const driver = require("../neo4jdriver");
const session = driver.session();

const { getConnection } = require("../redisclient");

router.post("", async(req, res) => {
    try {
        const cypher = `MATCH (u:User), (p:Post)<-[:SHARED]-(toUser:User)
                        WHERE id(u)=$userId AND id(p)=$postId
                        SET p.commentNo=p.commentNo+1
                        MERGE (u)-[r:COMMENTED{comment: $comment, time: $time}]->(p)
                        MERGE (toUser)-[:HAS]->(n:Notification{
                            from: u.username,
                            to: toUser.username,
                            timeSent: $time,
                            read: $read,
                            content: id(r),
                            type: 'post-comment'
                        })
                        RETURN n`;
        const params = {
            userId: req.body.userId,
            postId: req.body.postId,
            comment: req.body.comment,
            time: new Date().toString(),
            read: false,
        };
        const result = await session.run(cypher, params);
        const notification = {
            id: result.records[0].get("n").identity.low,
            ...result.records[0].get("n").properties,
        };
        getConnection().then((redisClient) =>
            redisClient.publish(
                "user-updates:" + notification.to,
                JSON.stringify({ type: "new-notification", payload: notification })
            )
        );

        return res.send("comment postavljen uspesno");
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }
});

// Vracanje opsega komenatara objave
router.get("/:postId/:startIndex/:count", async(req, res) => {
    try {
        const cypher = `MATCH (u:User)-[r:COMMENTED]->(p:Post)
                        WHERE id(p)=$postId
                        RETURN r, u
                        ORDER BY r.time DESC
                        SKIP $startIndex
                        LIMIT $count`;
        const params = {
            postId: int(req.params.postId),
            startIndex: int(req.params.startIndex),
            count: int(req.params.count),
        };
        const result = await session.run(cypher, params);
        return res.send({
            comments: result.records.map((c) => ({
                id: c.get("r").identity.low,
                username: c.get("u").properties.username,
                ...c.get("r").properties,
            })),
        });
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;