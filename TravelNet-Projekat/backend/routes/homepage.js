require("dotenv").config();
const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../storage");
const { int } = require("neo4j-driver");
const driver = require("../neo4jdriver");
const session = driver.session();
const redis = require("../redisclient");

router.get("/:username/:startIndex/:count", async(req, res) => {
    try {
        const startIndex = parseInt(req.params.startIndex);
        const count = parseInt(req.params.count);
        const username = req.params.username;

        const redisClient = await redis.getConnection();
        let result = (
            await redisClient.lRange(
                `homepagePosts:${username}`,
                startIndex,
                count - 1
            )
        ).map((x) => JSON.parse(x));

        if (result.length == 0) {
            const cypher = `MATCH (logU:User{username: $username})-[:IS_FRIEND]->(u:User)-[s:SHARED]->(p:Post)-[:LOCATED_AT]->(loc:Location)
            OPTIONAL MATCH (p)<-[l:LIKED]-(logU)
            WITH u,s,p,l,loc
            ORDER BY s.time DESC
            SKIP $start LIMIT $count
            RETURN id(u), u.firstName, u.lastName, u.username, u.image, id(loc), loc.country, loc.city, count(l) > 0 as liked, p`;

            const params = {
                username: req.params.username,
                start: int(req.params.startIndex),
                count: int(req.params.count),
            };

            /* const result = await session.run(cypher, params);
            return res.send(result.records); */

            result = (await session.run(cypher, params)).records.map((x) => ({
                post: {
                    id: x.get('p').identity.low,
                    image: x.get('p').properties.image,
                    commentNo: x.get('p').properties.commentNo.low,
                    likeNo: x.get('p').properties.likeNo.low,
                    desc: x.get('p').properties.description,
                    liked: x.get('liked')
                },
                user: {
                    id: x.get('id(u)').low,
                    fName: x.get('u.firstName'),
                    lName: x.get('u.lastName'),
                    username: x.get('u.username'),
                    image: x.get('u.image')
                },
                loc: {
                    id: x.get('id(loc)').low,
                    city: x.get('loc.city'),
                    country: x.get('loc.country')
                }
            }));

            if (result) {
                await redisClient
                    .multi()
                    .rPush(
                        `homepagePosts:${username}`,
                        ...result.map((x) => JSON.stringify(x))
                    )
                    // LT je od verzije 7.0.0
                    // postavlja expiration samo ukoliko je trenutno vreme isteka manje od novog koje se postavlja
                    .expire(`homepagePosts:${username}`, 120, "LT")
                    .exec();
            }
        }
        console.log(result);
        return res.send(result);
    } catch (ex) {
        console.log(ex);
        res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;