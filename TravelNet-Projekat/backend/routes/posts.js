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
                time: new Date().toString(),
                image: imgPath,
            };
            let cypher;

            if (req.body.country && req.body.city) {
                params.country = req.body.country;
                params.city = req.body.city;
                cypher = `MATCH (u:User), (l:Location)
                      WHERE id(u)=$idU AND l.country=$country AND l.city=$city
                      SET l.postsNo=l.postsNo+1, u.postsNo=u.postsNo+1
                      CREATE (u)-[r1:SHARED{time: $time}]->(p:Post {description: $description, likeNo:0, commentNo:0, image: $image})-[r2:LOCATED_AT]->(l)
                      RETURN id(l), l.followersNo`;
            } else if (
                (req.body.country && req.body.newCity) ||
                (req.body.newCountry && req.body.newCity)
            ) {
                if (req.body.newCountry) {
                    const exist = await session.run(
                        `MATCH (l:Location{country: $newCountry}) RETURN l`, { newCountry: req.body.newCountry }
                    );
                    if (exist.records.length > 0) {
                        fs.unlink(req.file.path, (err) => {
                            if (err)
                                return res
                                    .status(401)
                                    .send(
                                        "Država koju ste uneli već postoji na spisku, proverite ponovo unete podatke."
                                    );
                        });
                        return res
                            .status(401)
                            .send(
                                "Država koju ste uneli već postoji na spisku, proverite ponovo unete podatke."
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
            CREATE (u)-[r1:SHARED{time: $time}]->(p:Post {description: $description, likeNo:0, commentNo:0, image: $image})-[r2:LOCATED_AT]->(l:Location {country: $country, city: $city, postsNo:1, followersNo:0})
            RETURN id(l), l.followersNo`;
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

            try {
                const result = await session.run(cypher, params);
                const locationId = String(result.records[0].get("id(l)").low);
                const followersNo = parseInt(
                    result.records[0].get("l.followersNo").low
                );
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

                if (followersNo > 0) {
                    try {
                        const message = `Lokacija ${params.country}, ${params.city}`;
                        const followedUsersCypher = `MATCH (u:User)-[:FOLLOWS]->(l:Location{
                                country: $country,
                                city: $city
                            })
                            MERGE (u)-[:HAS]->(n:Notification{
                                from: $from,
                                to: u.username,
                                timeSent: $time,
                                read: $read,
                                content: $locationId,
                                type: 'new-post-on-location'
                            })`;
                        await session.run(followedUsersCypher, {
                            country: params.country,
                            city: params.city,
                            time: new Date().toString(),
                            read: false,
                            from: message,
                            locationId,
                        });
                        await client.publish("location:" + locationId, message);
                    } catch (ex) {
                        console.log(ex);
                    }
                }
            } catch (ex) {
                console.log(ex);
            }

            return res.send("Objava uspesno dodata");
        } catch (ex) {
            fs.unlink(req.file.path, (err) => {
                if (err)
                    return res
                        .status(401)
                        .send(
                            "Lokacija koju ste uneli već postoji na spisku lokacija, proverite ponovo unete podatke."
                        );
            });
            return res
                .status(401)
                .send(
                    "Lokacija koju ste uneli već postoji na spisku lokacija, proverite ponovo unete podatke."
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
        return res.status(401).send("Došlo je do greške");
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
        console.log(
            req.body.imagePath.substring(req.body.imagePath.indexOf("/images"))
        );
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
        return res.status(401).send("Došlo je do greške");
    }
});

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
        return res.status(401).send("Došlo je do greške");
    }
}); */

module.exports = router;