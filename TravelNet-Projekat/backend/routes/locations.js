const driver = require('../neo4jdriver');
const redis = require('../redisclient');
const express = require("express");
const router = express.Router();
const { int } = require('neo4j-driver');
const { arrayBuffer } = require('stream/consumers');
const session = driver.session();

//korisnik zapracuje lokaciju
router.post("/follow", async(req, res) => {
    try {
        const cypher = `MATCH (u:User), (l:Location)
        WHERE id(u) = $userId AND id(l) = $locationId
        SET l.followersNo=l.followersNo+1, u.followedLocationsNo=u.followedLocationsNo+1
        MERGE (u)-[r:FOLLOWS{time: $time}]->(l)`;
        await session.run(cypher, {
            userId: int(req.body.userId),
            locationId: int(req.body.locationId),
            time: new Date().toString()
        });
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
        await session.run(cypher, { userId: int(req.params.userId), locationId: int(req.params.locationId) })
        return res.send("Lokacija je otpraćena")
    } catch (ex) {
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }

});
router.get("/leaderboard",async(req,res)=>{
    try{
        const client = await redis.getConnection();
        let setExist = await client.sendCommand(['EXISTS','zsetLocations']);
        if(!setExist){
        const cypher = 'MATCH (l:Location) RETURN id(l),l.country,l.city,l.postsNo'
        const neo4JList = await session.run(cypher)
        neo4JList.records.forEach(async (element) => {
           await client.sendCommand(['hset',"'location:" +String(element.get(0).low) + "'",'city',String(element.get(2))]);
           await client.sendCommand(['hset',"'location:" +String(element.get(0).low) + "'",'country',String(element.get(1))]);
           await client.sendCommand(['zadd', 'lzsetLocations', String(element.get(3).low),"'location:" +String(element.get(0).low) + "'"]);
        });
    }   
        const listRedis = await client.sendCommand(['ZREVRANGE','zsetLocations','0','100','WITHSCORES']);
        return res.send(listRedis);
    }
    catch (ex) {
        console.log(ex);
        res.status(401).send("Došlo je do greške");
    }
  
})
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

module.exports = router;
