const express = require("express");
const router = express.Router();

const { int } = require("neo4j-driver");
const driver = require("../neo4jdriver");
const session = driver.session();

router.get("/conversations/:userId/:startIndex/:count", async(req, res) => {
    try {
        const cypher = `MATCH (u1: User)-[r1:HAS]->(c:Chat)<-[r2:HAS]-(u2: User)
                        WHERE id(u1) = $userId
                        WITH c, u2
                        RETURN u2.username, u2.image, c
                        ORDER BY c.topMessageTimeSent DESC
                        SKIP $startIndex
                        LIMIT $count`;
        const params = {
            userId: int(req.params.userId),
            startIndex: int(req.params.startIndex),
            count: int(req.params.count),
        };
        const result = await session.run(cypher, params);
        const parsedRes = result.records.map((x) => ({
            friendUsername: x.get(0),
            friendImage: x.get(1),
            id: x.get(2).identity.low,
            ...x.get(2).properties,
            unreadCount: x.get(2).properties.unreadCount.low,
            topMessageTimeSent: new Date(x.get(2).properties.topMessageTimeSent),
        }));

        return res.status(200).send(parsedRes);
    } catch (err) {
        console.log(err);
        return res.status(501).send("Došlo je do greske!");
    }
});

router.get(
    "/conversations/:name/:userId/:startIndex/:count",
    async(req, res) => {
        try {
            const cypher = `MATCH (u1: User)-[r1:HAS]->(c:Chat)<-[r2:HAS]-(u2: User)
                        WHERE id(u1) = $userId AND (u2.firstName CONTAINS $name OR u2.lastName CONTAINS $name OR u2.username CONTAINS $name)
                        WITH c, u2
                        RETURN u2.username, u2.image, c
                        ORDER BY c.topMessageTimeSent DESC
                        SKIP $startIndex
                        LIMIT $count`;
            const params = {
                userId: int(req.params.userId),
                startIndex: int(req.params.startIndex),
                count: int(req.params.count),
                name: req.params.name,
            };
            const result = await session.run(cypher, params);
            const parsedRes = result.records.map((x) => ({
                friendUsername: x.get(0),
                friendImage: x.get(1),
                id: x.get(2).identity.low,
                ...x.get(2).properties,
                unreadCount: x.get(2).properties.unreadCount.low,
                topMessageTimeSent: new Date(x.get(2).properties.topMessageTimeSent),
            }));

            return res.status(200).send(parsedRes);
        } catch (err) {
            console.log(err);
            return res.status(501).send("Došlo je do greske!");
        }
    }
);

router.get("/locations/:name/:userId/:startIndex/:count", async(req, res) => {
    try {
        const cypher = `WITH toLower($name) as lower
                        MATCH (l:Location)
                        WHERE toLower(l.city) CONTAINS lower
                        OR toLower(l.country) CONTAINS lower
                        CALL
                        {
                            WITH l
                            OPTIONAL MATCH k=(u:User)-[:FOLLOWS]->(l) WHERE id(u)=$userId
                            RETURN k IS NOT NULL as FOLLOWS
                        }
                        RETURN l, FOLLOWS
                        ORDER BY l.country, l.city ASC
                        SKIP $startIndex
                        LIMIT $count`;
        const params = {
            userId: int(req.params.userId),
            startIndex: int(req.params.startIndex),
            count: int(req.params.count),
            name: req.params.name,
        };
        const result = await session.run(cypher, params);
        const parsedRes = result.records.map((x) => ({
            id: x.get("l").identity.low,
            ...x.get("l").properties,
            follows: x.get("FOLLOWS"),
        }));

        return res.status(200).send(parsedRes);
    } catch (err) {
        console.log(err);
        return res.status(501).send("Došlo je do greske!");
    }
});

router.get("/users/:name/:userId/:startIndex/:count", async(req, res) => {
    try {
        const cypher = `WITH toLower($name) as lower
                        MATCH (u:User)
                        WHERE toLower(u.username) CONTAINS lower
                        OR toLower(u.firstName) CONTAINS lower 
                        OR toLower(u.lastName) CONTAINS lower
                        CALL
                        {
                            WITH u
                            OPTIONAL MATCH p=(u)-[:IS_FRIEND]->(u1) WHERE id(u1)=$userId
                            OPTIONAL MATCH q=(u)-[:SENT_REQUEST]->(u1) WHERE id(u1)=$userId
                            OPTIONAL MATCH r=(u)<-[:SENT_REQUEST]-(u1) WHERE id(u1)=$userId
                            RETURN {friends: p IS NOT NULL, requested: q IS NOT NULL, pending: r IS NOT NULL} AS STATUS
                        }
                        RETURN u, STATUS
                        ORDER BY u.firstName, u.lastName, u.username ASC
                        SKIP $startIndex
                        LIMIT $count`;
        const params = {
            userId: int(req.params.userId),
            startIndex: int(req.params.startIndex),
            count: int(req.params.count),
            name: req.params.name,
        };
        const result = await session.run(cypher, params);
        const parsedRes = result.records.map((x) => ({
            id: x.get("u").identity.low,
            ...x.get("u").properties,
            status: x.get("STATUS"),
        }));

        return res.status(200).send(parsedRes);
    } catch (err) {
        console.log(err);
        return res.status(501).send("Došlo je do greske!");
    }
});

router.get("/posts/:name/:userId/:startIndex/:count", async(req, res) => {
    try {
        const cypher = `WITH toLower($name) AS lower
                        MATCH (u:User)-[r:SHARED]->(p:Post)-[:LOCATED_AT]->(l:Location)
                        WHERE (NOT id(u) = $userId) AND 
                        (toLower(u.username) CONTAINS lower 
                        OR toLower(u.firstName) CONTAINS lower 
                        OR toLower(u.lastName) CONTAINS lower
                        OR toLower(l.city) CONTAINS lower
                        OR toLower(l.country) CONTAINS lower)
                        CALL
                        {
                            WITH p
                            OPTIONAL MATCH l=(u1)-[:LIKED]->(p) WHERE id(u1)=$userId
                            RETURN l IS NOT NULL AS LIKED
                        }
                        RETURN { id: id(p), username: u.username, userImage: u.image, 
                                city: l.city, country: l.country,
                                image: p.image, description: p.description, 
                                time: r.time, likeNo: p.likeNo, commentNo: p.commentNo,
                                liked: LIKED } as POST
                        ORDER BY r.time DESC
                        SKIP $startIndex
                        LIMIT $count`;
        const params = {
            userId: int(req.params.userId),
            startIndex: int(req.params.startIndex),
            count: int(req.params.count),
            name: req.params.name,
        };
        const result = await session.run(cypher, params);
        const parsedRes = result.records.map((x) => ({
            ...x.get("POST"),
            id: x.get("POST").id.low,
            likeNo: x.get("POST").likeNo.low,
            commentNo: x.get("POST").commentNo.low,
            time: new Date(x.get("POST").time),
        }));

        return res.status(200).send(parsedRes);
    } catch (err) {
        console.log(err);
        return res.status(501).send("Došlo je do greske!");
    }
});

module.exports = router;