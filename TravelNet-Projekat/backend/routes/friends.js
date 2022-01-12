const express = require("express");
const router = express.Router();

const driver = require("../neo4jdriver");
const { int } = require("neo4j-driver");
const session = driver.session();

const { getConnection, getChatId } = require("./../redisclient");

//slanje zahteva za prijateljstvo(u1 salje u2 zahtev)
router.post("/request", async(req, res) => {
    try {
        const cypher = `MATCH (u1:User), (u2:User)
                        WHERE u1.username=$u1 AND u2.username=$u2
                        MERGE (u1)-[r:SENT_REQUEST{time: $time}]->(u2)
                        RETURN ID(r)`;
        const params = {
            u1: req.body.username1,
            u2: req.body.username2,
            time: new Date().toString(),
        };
        const result=await session.run(cypher, params);

        getConnection().then(redisClient=>redisClient.publish("sent-friend-request:" + to, JSON.stringify({
          id: 0,
          from: req.body.username1,
          to: req.body.username2,
          type: "sent-friend-request",
          content: result.records[0].get('ID(r)'),
          timeSent: new Date()
          })));

        return res.send("Zahtev je poslat uspešno.");
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške, probajte ponovo.");
    }
});

//brisanje zahteva za prijateljstvo(u1 brise zahtev ili u2 odbija zahtev)
router.delete("/request", async(req, res) => {
    try {
        const cypher = `MATCH (u1:User)-[r:SENT_REQUEST]->(u2:User)
                        WHERE u1.username=$u1 AND u2.username=$u2
                        DELETE r`;
                        /* MATCH (n:Notification)
                        WHERE n.from=$u1 AND n.to=$u2 AND n.type="sent-friend-request"
                        DETACH DELETE n */
        const params = {
            u1: req.body.username1,
            u2: req.body.username2,
        };
        await session.run(cypher, params);
        return res.send("Zahtev je obrisan uspešno.");
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške, probajte ponovo.");
    }
});

//prihvatanje zahteva za prijateljstvo(u2 prihvata u1)
router.post("/accept", async(req, res) => {
    try {
        const cypher = `MATCH (u1:User), (u2:User), (u1:User)-[r3:SENT_REQUEST]->(u2:User)
                        WHERE id(u1)=$id1 AND id(u2)=$id2
                        SET u1.friendsNo=u1.friendsNo+1, u2.friendsNo=u2.friendsNo+1
                        MERGE (u1)<-[r1:IS_FRIEND{since: $since, chatId: $chatId}]-(u2)
                        MERGE (u1)-[r2:IS_FRIEND{since: $since, chatId: $chatId}]->(u2)
                        MERGE (u1)-[r3:HAS]->(c:Chat)<-[r4:HAS]-(u2)
                        DELETE r3
                        RETURN u1.username, u2.username`;
        const params = {
            id1: req.body.id1,
            id2: req.body.id2,
            since: new Date().toString(),
            chatId: getChatId(req.body.id1, req.body.id2),
        };
        const result=await session.run(cypher, params);

        getConnection().then(redisClient=>redisClient.publish("accepted-friend-request:" + to, JSON.stringify({
          id: 0,
          from: result.records[0].get('u2.username'),
          to: result.records[0].get('u1.username'),
          type: "accepted-friend-request",
          content: '',
          timeSent: new Date()
          })));
        return res.send("Zahtev je prihvacen");
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }
});

//brisanje prijatelja
router.delete("", async(req, res) => {
    try {
        const cypher = `MATCH (u1:User)-[r1:IS_FRIEND]->(u2:User), (u1:User)<-[r2:IS_FRIEND]-(u2:User)
                        WHERE id(u1)=$id1 AND id(u2)=$id2
                        SET u1.friendsNo=u1.friendsNo-1, u2.friendsNo=u2.friendsNo-1
                        DELETE r1, r2`;
        const params = {
            id1: req.body.id1,
            id2: req.body.id2,
        };
        await session.run(cypher, params);
        return res.send("Brisanje prijatelja je uspesno");
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }
});

//preporuka prijatelja korisniku ciji je id proslednjen, sortirani po broju zajednickih prijatelja
router.get("/recommendation/:userId", async(req, res) => {
    try {
        let cypher = `MATCH (u:User)-[r1:IS_FRIEND]->(friend:User)-[r2:IS_FRIEND]->(friendOfFriend:User)
                    WHERE id(u)=$id AND id(friendOfFriend)<>$id
                    RETURN DISTINCT count(friendOfFriend) AS mutalFriends,
                    id(friendOfFriend) AS id,
                    friendOfFriend.username AS username,
                    friendOfFriend.firstName AS firstName,
                    friendOfFriend.lastName AS lastName,
                    friendOfFriend.image AS image
                    ORDER BY mutualFriends DESC
                    LIMIT 10`;
        const params = { id: parseInt(req.params.userId) };
        const result = await session.run(cypher, params);
        const rez = result.records.map((record) => ({
            id: record.get("id").low,
            mutualFriends: record.get("mutualFriends").low,
            username: record.get("username"),
            firstName: record.get("firstName"),
            lastName: record.get("lastName"),
            image: record.get("image"),
        }));
        res.send(rez);
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }
});

// Vracanje opsega prijatelja korisnika
router.get("/:username/:startIndex/:count", async(req, res) => {
    try {
        const cypher = `MATCH (u1:User { username: $username })<-[r:IS_FRIEND]->(u2:User)
                        RETURN DISTINCT u2
                        ORDER BY r.since DESC
                        SKIP $startIndex
                        LIMIT $count`;
        const params = {
            username: req.params.username,
            startIndex: int(req.params.startIndex),
            count: int(req.params.count),
        };
        const result = await session.run(cypher, params);
        const rez = {
            friends: result.records.map((x) => ({
                id: x.get("u2").identity.low,
                ...x.get("u2").properties,
            })),
        };
        res.send(rez);
    } catch (ex) {
        console.log(ex);
        res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;
