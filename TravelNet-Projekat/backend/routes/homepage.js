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
            const cypher = `MATCH (u1:User{username: $username})-[:IS_FRIEND]->(u2:User)-[r:SHARED]->(p:Post)-[:LOCATED_AT]->(l:Location) 
                            CALL
                            {
                                WITH u1, p
                                MATCH k=(u1)-[:LIKED]->(p)
                                RETURN k IS NOT NULL AS liked
                            }
                            RETURN { id: id(p), desc: p.description, imagePath: p.image, commentsNo: p.commentNo, likesNo: p.likeNo, liked: liked,
                                location: { id: id(l), city: l.city, country: l.country },
                                person: { id: id(u2), firstName: u2.firstName, lastName: u2.lastName, username: u2.username, imagePath: u2.image }
                            } AS post
                            ORDER BY r.time DESC
                            SKIP $start
                            LIMIT $count`;

            const params = {
                username,
                start: int(startIndex),
                count: int(count),
            };

            result = (await session.run(cypher, params)).records.map((x) => ({
                ...x.get("post"),
                id: x.get("post").id.low,
                commentsNo: x.get("post").commentsNo.low,
                likesNo: x.get("post").likesNo.low,
                location: {
                    ...x.get("post").location,
                    id: x.get("post").location.id.low,
                },
                person: {
                    ...x.get("post").person,
                    id: x.get("post").person.id.low,
                },
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
        res.send(result);
    } catch (ex) {
        console.log(ex);
        res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;