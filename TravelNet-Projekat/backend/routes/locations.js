require("dotenv").config();
const express = require("express");
const router = express.Router();
const { int } = require('neo4j-driver');

const driver = require('../neo4jdriver');
const session = driver.session();

const redisClient = require('../redisclient');

//korisnik zapracuje lokaciju
router.post("/follow", async(req, res) => {
    try {
        const cypher = `MATCH (u:User), (l:Location)
        WHERE id(u) = $userId AND id(l) = $locationId
        SET l.followersNo=l.followersNo+1, u.followedLocationsNo=u.followedLocationsNo+1
        MERGE (u)-[r:FOLLOWS{time: $time}]->(l)`;
        const locationId=req.body.locationId
        await session.run(cypher, {
            userId: req.body.userId,
            locationId: locationId,
            time: new Date().toString()
        });

        const subscriber = await redisClient.getSubscriber()
        subscriber.subscribe("location:"+String(locationId))
        console.log("loc", subscriber)

        return res.send("Lokacija je zapraćena");
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }

})

//korisnik otpracuje lokaciju
router.delete("/:userId/:locationId/unfollow", async(req, res) => {
    try {
        const cypher = `MATCH (u:User)-[r:FOLLOWS]->(l:Location)
        WHERE id(u)=$userId AND id(l)=$locationId
        SET l.followersNo=l.followersNo-1, u.followedLocationsNo=u.followedLocationsNo-1
        DELETE r`
        const locationId=int(req.params.locationId)
        await session.run(cypher, { userId: int(req.params.userId), locationId: locationId })
        const subscriber = await redisClient.getSubscriber();
        subscriber.unsubscribe("location:"+req.params.locationId)
        return res.send("Lokacija je otpraćena")
    } catch (ex) {
        console.log(ex)
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
            count: int(req.params.count)
        };
        const result = await session.run(cypher, params);
        const rez = {
            locations: result.records.map(x => ({
                id: x.get("l").identity.low,
                time: x.get("r").properties.time,
                ...x.get("l").properties
            }))
        };
        res.send(rez);
    } catch (ex) {
        console.log(ex);
        res.status(401).send("Došlo je do greške");
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
            count: int(req.params.count)
        };
        const result = await session.run(cypher, params);
        const rez = {
            locations: result.records.map(x => ({
                id: x.get("l").identity.low,
                ...x.get("l").properties
            }))
        };
        res.send(rez);
    } catch (ex) {
        console.log(ex);
        res.status(401).send("Došlo je do greške");
    }
});


//vracamo sve lokacije
router.get("/all-locations", async(req, res) => {
    try{
        const cypher = `MATCH(l:Location) RETURN id(l), l.country, l.city`;
        const result = await session.run(cypher, {});
        if(result.records.length == 0){
            return [];
        }
        const locations = [];
        result.records.forEach(record => {
            let location = {
                id: record.get("id(l)").low,
                country: record.get(1),
                city: record.get(2)
            };
            locations.push(location);
        })

        return res.send(locations);
    }
    catch(err){
        return res.status(501).send("Doslo je do greske!");
    }
});

module.exports = router;
