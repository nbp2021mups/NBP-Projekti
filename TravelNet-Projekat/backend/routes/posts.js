const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../storage");
const { int } = require("neo4j-driver");
const fs = require("fs");

const driver = require("../neo4jdriver");
const session = driver.session();

const redisClient = require("../redisclient");

//dodavanje objave od strane korisnika ciji je id proslednjen
router.post(
    "",
    multer({ storage: storage }).single("image"),
    async(req, res) => {
        try {
            const url = req.protocol + "://" + req.get("host");
            const imgPath = url + "/images/" + req.file.filename;
            const params = {
                description: req.body.description,
                idU: int(req.body.userId),
                image: imgPath,
            };
            let cypher;

            if (req.body.country && req.body.city) {
                params.country = req.body.country;
                params.city = req.body.city;
                cypher = `MATCH (u:User), (l:Location)
                      WHERE id(u)=$idU AND l.country=$country AND l.city=$city
                      SET l.postsNo=l.postsNo+1, u.postsNo=u.postsNo+1
                      CREATE (u)-[r1:SHARED{time: datetime()}]->(p:Post {description: $description, likeNo:0, commentNo:0, image: $image})-[r2:LOCATED_AT]->(l)
                      RETURN id(l), l.followersNo, u.username`;
            } else if (
                (req.body.country && req.body.newCity) ||
                (req.body.newCountry && req.body.newCity)
            ) {
                if (req.body.newCountry) {
                    const exist = await session.run(
                        `MATCH (l:Location{country: $newCountry})
                        RETURN l`, { newCountry: req.body.newCountry }
                    );
                    if (exist.records.length > 0) {
                        fs.unlink(req.file.path, (err) => {
                            if (err)
                                return res
                                    .status(401)
                                    .send(
                                        "Dr??ava koju ste uneli ve?? postoji na spisku, proverite ponovo unete podatke."
                                    );
                        });
                        return res
                            .status(401)
                            .send(
                                "Dr??ava koju ste uneli ve?? postoji na spisku, proverite ponovo unete podatke."
                            );
                    }
                }

                params.country = req.body.country ?
                    req.body.country :
                    req.body.newCountry;
                params.city = req.body.city ? req.body.city : req.body.newCity;

                cypher = `MATCH (u:User)
                        WHERE id(u)=$idU
                        SET u.postsNo=u.postsNo+1
                        CREATE (u)-[r1:SHARED{time: datetime()}]->(p:Post {description: $description, likeNo:0, commentNo:0, image: $image})-[r2:LOCATED_AT]->(l:Location {country: $country, city: $city, postsNo:1, followersNo:0})
                        WITH l, u
                        RETURN id(l), l.followersNo, u.username`;
            } else {
                fs.unlink(req.file.path, (err) => {
                    if (err)
                        return res
                            .status(401)
                            .send("Uneti podaci nisu validni, proverite ponovo.");
                });
                return res
                    .status(401)
                    .send("Uneti podaci nisu validni, proverite ponovo.");
            }
            const result = await session.run(cypher, params);
            const locationId = String(result.records[0].get("id(l)").low);
            const from = result.records[0].get("u.username");
            const followersNo = result.records[0].get("l.followersNo");
            const client = await redisClient.getConnection();

            if (req.body.country && req.body.city) {
                await client.sendCommand([
                    "ZINCRBY",
                    "locations-leaderboard",
                    "1",
                    "location:" + locationId,
                ]);
            } else {
                await client.sendCommand([
                    "HSET",
                    "location:" + locationId,
                    "city",
                    params.city,
                ]);
                await client.sendCommand([
                    "HSET",
                    "location:" + locationId,
                    "country",
                    params.country,
                ]);
                await client.sendCommand([
                    "ZADD",
                    "locations-leaderboard",
                    "1",
                    "location:" + locationId,
                ]);
            }

            if (followersNo && followersNo.low > 0) {
                try {
                    const message = {
                        text: `Lokacija ${params.country}, ${params.city}`,
                        from: from,
                        locationId,
                    };
                    const followedUsersCypher = `MATCH (u:User)-[:FOLLOWS]->(l:Location{
                              country: $country,
                              city: $city
                          })
                          MERGE (u)-[:HAS]->(n:Notification{
                              from: $loc,
                              to: u.username,
                              timeSent: datetime(),
                              read: $read,
                              content: id(l),
                              type: 'new-post-on-location'
                          })`;
                    await session.run(followedUsersCypher, {
                        country: params.country,
                        city: params.city,
                        read: false,
                        loc: message.text,
                    });

                    await client.publish(
                        "location:" + locationId,
                        JSON.stringify(message)
                    );
                } catch (ex) {
                    console.log(ex);
                }
            }

            return res.send("Objava uspesno dodata");
        } catch (ex) {
            fs.unlink(req.file.path, (err) => {
                if (err)
                    return res
                        .status(401)
                        .send(
                            "Lokacija koju ste uneli ve?? postoji na spisku lokacija, proverite ponovo unete podatke."
                        );
            });
            return res
                .status(401)
                .send(
                    "Lokacija koju ste uneli ve?? postoji na spisku lokacija, proverite ponovo unete podatke."
                );
        }
    }
);

//promena opisa objave
router.patch("/:postId", async(req, res) => {
    try {
        const cypher =
            "MATCH (p:Post) WHERE id(p) = $id SET p.description = $newDescription";
        const params = {
            id: int(req.params.postId),
            newDescription: req.body.newDescription,
        };
        await session.run(cypher, params);
        return res.send("Objava uspesno promenjena");
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Do??lo je do gre??ke");
    }
});

//brisanje objave svih veza sa kojima je imala
router.delete("/:postId", async(req, res) => {
    try {
        const cypher = `MATCH (u:User)-[r1:SHARED]->(p:Post)-[r2:LOCATED_AT]->(l:Location)
                        WHERE id(p) = $id
                        SET l.postsNo=l.postsNo-1, u.postsNo=u.postsNo-1
                        DETACH DELETE p
                        RETURN id(l)`;

        const result = await session.run(cypher, { id: int(req.params.postId) });
        const locationId = String(result.records[0].get("id(l)").low);

        const client = await redisClient.getConnection();
        await client.sendCommand([
            "ZINCRBY",
            "locations-leaderboard",
            "-1",
            "location:" + locationId,
        ]);

        const path =
            "./backend" +
            req.body.imagePath.substring(req.body.imagePath.indexOf("/images"));
        fs.unlink(path, (err) => {
            if (err) console.log(err);
        });

        return res.send("Objava uspesno obrisana");
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Do??lo je do gre??ke");
    }
});

router.get("/loadPosts/:otherU/:loggedU/:skip/:limit", async(req, res) => {
    try {
        const cypher = `MATCH (otherU:User{username: $otherU})-[s:SHARED]->(p:Post)-[:LOCATED_AT]->(loc: Location)
                        OPTIONAL MATCH (p)<-[l:LIKED]-(logU:User{username: $loggedU})
                        WITH count(l) > 0 as liked, otherU, p, loc, s
                        ORDER BY s.time DESC
                        SKIP $skip LIMIT $limit
                        RETURN collect({post: p, loc: {id: id(loc), city: loc.city, country: loc.country}, liked: liked}) as posts`;

        const params = {
            otherU: req.params.otherU,
            loggedU: req.params.loggedU,
            skip: int(req.params.skip),
            limit: int(req.params.limit),
        };

        const result = await session.run(cypher, params);

        if (result.records.length == 0) {
            return res.send([]);
        }

        const parsedRes = [];
        const posts = result.records[0].get(0);
        posts.forEach((post) => {
            parsedRes.push({
                id: post.post.identity.low,
                image: post.post.properties.image,
                desc: post.post.properties.description,
                commentNo: post.post.properties.commentNo.low,
                likeNo: post.post.properties.likeNo.low,
                loc: {
                    id: post.loc.id.low,
                    city: post.loc.city,
                    country: post.loc.country,
                },
                liked: post.liked,
            });
        });

        return res.send(parsedRes);
    } catch (err) {
        console.log(err);
        return res
            .status(501)
            .send("Doslo je do greske prilikom ucitavanja objava!");
    }
});

router.get(
    "/loadPostsLocation/:idLoc/:loggedU/:skip/:limit",
    async(req, res) => {
        try {
            const cypher = `MATCH (u:User)-[s:SHARED]->(p:Post)-[:LOCATED_AT]->(loc: Location)
        WHERE id(loc)=$idLoc
        WITH p, s, loc, u
        OPTIONAL MATCH(logU: User{username: $username})-[l:LIKED]->(p)
        WITH p, s, loc, u, count(l) > 0 as liked
        ORDER BY s.time DESC
        SKIP $skip LIMIT $limit
        RETURN collect({user: {id: id(u), username:u.username, fName: u.firstName, lName: u.lastName, image: u.image}, post:
        p, liked: liked}) as posts`;

            const params = {
                idLoc: int(req.params.idLoc),
                username: req.params.loggedU,
                skip: int(req.params.skip),
                limit: int(req.params.limit),
            };

            const result = await session.run(cypher, params);

            const parsedPosts = [];
            const posts = result.records[0].get(0);
            posts.forEach((post) => {
                parsedPosts.push({
                    id: post.post.identity.low,
                    image: post.post.properties.image,
                    likeNo: post.post.properties.likeNo.low,
                    commentNo: post.post.properties.commentNo.low,
                    desc: post.post.properties.description,
                    user: {
                        id: post.user.id.low,
                        firstName: post.user.fName,
                        lastName: post.user.lName,
                        username: post.user.username,
                        image: post.user.image,
                    },
                    liked: post.liked,
                });
            });
            return res.send(parsedPosts);
        } catch (err) {
            console.log(err);
            return res.status(501).send("Doslo je do greske!");
        }
    }
);

//vracanje ukupnog broja komentara i lajkova za konkretnu objavu
/* router.get("/:postId/reactions", async(req, res) => {
    try {
        const cypher = 'MATCH (p:Post)<-[r]->() WHERE id(p) = $id AND (type(r)="LIKED" OR type(r)="COMMENTED") RETURN type(r), count(*)';
        const result = await session.run(cypher, { id: int(req.params.postId) });
        const rez = {
            likes: result.records[0].get('count(*)').low,
            comments: result.records[1].get('count(*)').low
        }
        return res.send(rez);
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Do??lo je do gre??ke");
    }
}); */

module.exports = router;