require("dotenv").config();
const express = require("express");
const router = express.Router();
const { int } = require("neo4j-driver");

const driver = require("../neo4jdriver");
const session = driver.session();

const redisClient = require("../redisclient");

//korisnik zapracuje lokaciju
router.post("/follow", async(req, res) => {
    try {
        const cypher = `MATCH (u:User), (l:Location)
        WHERE id(u) = $userId AND id(l) = $locationId
        SET l.followersNo=l.followersNo+1, u.followedLocationsNo=u.followedLocationsNo+1
        MERGE (u)-[r:FOLLOWS{time: $time}]->(l)
        RETURN u.username`;
        const locationId = req.body.locationId;
        const result = await session.run(cypher, {
            userId: req.body.userId,
            locationId: locationId,
            time: new Date().toString(),
        });

        if (result.records.length > 0){
          console.log(result.records[0].get('u.username'),"ovde2")
            redisClient.getConnection().then((conn) => {
                conn.publish(
                    `followed-location:${result.records[0].get('u.username')}`,
                    String(locationId)
                );
            });


        }

        return res.send("Lokacija je zapraćena");
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }
});

//korisnik otpracuje lokaciju
router.delete("/:userId/:locationId/unfollow", async(req, res) => {
    try {
        const cypher = `MATCH (u:User)-[r:FOLLOWS]->(l:Location)
        WHERE id(u)=$userId AND id(l)=$locationId
        SET l.followersNo=l.followersNo-1, u.followedLocationsNo=u.followedLocationsNo-1
        DELETE r
        RETURN u.username`;
        const locationId = int(req.params.locationId);
        const result=await session.run(cypher, {
            userId: int(req.params.userId),
            locationId: locationId,
        });
        redisClient.getConnection().then((conn) => {
          conn.publish(
              `unfollow-location:${result.records[0].get('u.username')}`, String(locationId)
            );
        });

        return res.send("Lokacija je otpraćena");
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }
});

// Vracanje opsega lokacija koje korisnik prati
router.get("/follows/:username/:startIndex/:count", async(req, res) => {
    try {
        const cypher = `MATCH (u:User { username: $username })-[r:FOLLOWS]->(l:Location)
                        RETURN l, r
                        ORDER BY r.time DESC
                        SKIP $startIndex
                        LIMIT $count`;
        const params = {
            username: req.params.username,
            startIndex: int(req.params.startIndex),
            count: int(req.params.count),
        };
        const result = await session.run(cypher, params);
        const rez = {
            locations: result.records.map((x) => ({
                id: x.get("l").identity.low,
                time: x.get("r").properties.time,
                ...x.get("l").properties,
            })),
        };
        res.send(rez);
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }
});

// Vracanje opsega lokacija koje je korisnik tagovao u postovima (posetio)
router.get("/postedOn/:username/:startIndex/:count", async(req, res) => {
    try {
        const cypher = `MATCH (u:User { username: $username })-[r1:SHARED]->(p:Post)-[r2:LOCATED_AT]->(l:Location)
                        RETURN l
                        ORDER BY r1.time DESC
                        SKIP $startIndex
                        LIMIT $count`;
        const params = {
            username: req.params.username,
            startIndex: int(req.params.startIndex),
            count: int(req.params.count),
        };
        const result = await session.run(cypher, params);
        const rez = {
            locations: result.records.map((x) => ({
                id: x.get("l").identity.low,
                ...x.get("l").properties,
            })),
        };
        res.send(rez);
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }
});

//vracamo sve lokacije
router.get("/all-locations", async(req, res) => {
    try {
        const cypher = `MATCH(l:Location) RETURN id(l), l.country, l.city`;
        const result = await session.run(cypher, {});
        if (result.records.length == 0) {
            return [];
        }
        const locations = [];
        result.records.forEach((record) => {
            let location = {
                id: record.get("id(l)").low,
                country: record.get(1),
                city: record.get(2),
            };
            locations.push(location);
        });

        return res.send(locations);
    } catch (err) {
        return res.status(501).send("Doslo je do greske!");
    }
});

router.get("/:locationId/posts/:userId", async(req, res) => {
    try {
        const cypher = `MATCH (loc:Location)<-[:LOCATED_AT]-(post:Post)<-[s:SHARED]-(u:User)
                  WITH loc,post,u,s
                  WHERE ID(loc)=$idL
                  ORDER BY s.time DESC
                  LIMIT $limit
                  CALL{
                    WITH post
                    MATCH (post)<-[like:LIKED]-(logUser:User)
                    WHERE ID(logUser)=$idU
                    RETURN count(like)>0 AS liked
                  }
                  RETURN loc, collect([post, id(u), u.username, u.firstName, u.lastName, u.image, liked]) AS posts`;

        const params = {
            idL: int(req.params.locationId),
            idU: int(req.params.userId),
            limit: int(req.params.limit),
        };

        const result = await session.run(cypher, params);
        const location = result.records[0].get("loc");

        const response = {
            locationId: location.identity.low,
            country: location.properties.country,
            city: location.properties.city,
            followersNo: location.properties.followersNo.low,
            postsNo: location.properties.followersNo.low,
            posts: [],
        };

        result.records[0].get("posts").forEach((post) => {
            const currentPost = post[0];
            response.posts.push({
                post: {
                    id: currentPost.identity.low,
                    image: currentPost.properties.image,
                    commentNo: currentPost.properties.commentNo.low,
                    likeNo: currentPost.properties.likeNo.low,
                    description: currentPost.properties.description,
                },
                user: {
                    id: post[1].low,
                    username: post[2],
                    firstName: post[3],
                    lastName: post[4],
                    image: post[5],
                },
                liked: post[6],
            });
        });

        return res.send(response);
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;
