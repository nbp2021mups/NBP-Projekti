const driver = require("../neo4jdriver");
const redis = require("../redisclient");
const express = require("express");
const router = express.Router();
const session = driver.session();

router.get("", async(req, res) => {
    try {
        const client = await redis.getConnection();
        const setExist = await client.sendCommand(["ZCOUNT","locations-leaderboard","-inf","+inf"]);

        if (setExist == 0) {
            const cypher ="MATCH (l:Location) RETURN id(l), l.country, l.city, l.postsNo";
            const neo4JList = await session.run(cypher);
            neo4JList.records.forEach(async(element) => {
              await client.sendCommand(["HSET","location:" + String(element.get(0).low),"city", element.get(2)]);
              await client.sendCommand(["HSET","location:" + String(element.get(0).low),"country",element.get(1)]);
              await client.sendCommand(["ZADD","locations-leaderboard",String(element.get(3).low),"location:" + String(element.get(0).low)]);
            });
        }
        const topLocations = await client.sendCommand(["ZRANGE","locations-leaderboard","0","4","REV","WITHSCORES"]);
        const response = [];
        for (let i=0;i<topLocations.length;i+=2){
          const locId= topLocations[i].substring(topLocations[i].indexOf(':')+1);
          const locInfo=await client.sendCommand(["HMGET",topLocations[i],"city", "country"]);
          response.push({
            id:locId,
            city:locInfo[0],
            country:locInfo[1],
            postsNo:topLocations[i+1]
          })
        }
        return res.send(response);
    } catch (ex) {
        console.log(ex);
        return res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;
