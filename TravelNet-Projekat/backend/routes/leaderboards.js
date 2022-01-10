const driver = require('../neo4jdriver');
const redis = require('../redisclient');
const express = require("express");
const router = express.Router();
const session = driver.session();


router.get("",async(req,res)=>{
  try{
      const client = await redis.getConnection();
      const setExist = await client.sendCommand(["EXISTS","locations-leaderboard"]);

      if(setExist==0){
        const cypher = 'MATCH (l:Location) RETURN id(l), l.country, l.city, l.postsNo'
        const neo4JList = await session.run(cypher)
        neo4JList.records.forEach(async (element) => {
          await client.sendCommand(["HSET", "location:" + String(element.get(0).low), "city", element.get(2)]);
          await client.sendCommand(["HSET", "location:" + String(element.get(0).low), "country", element.get(1)]);
          await client.sendCommand(["ZADD", "locations-leaderboard", String(element.get(3).low),"location:" +String(element.get(0).low)]);
        });
  }
      const listRedis = await client.sendCommand(['ZRANGE',"locations-leaderboard","0", "2", "REV", "WITHSCORES"]);
      return res.send(listRedis);
  }
  catch (ex) {
      console.log(ex);
      res.status(401).send("Došlo je do greške");
  }

})

module.exports = router;
