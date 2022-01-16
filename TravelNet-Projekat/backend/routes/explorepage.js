require("dotenv").config();
const express = require("express");
const router = express.Router();
const { int } = require('neo4j-driver');
const driver = require('../neo4jdriver');
const session = driver.session();
const redisClient = require('../redisclient');


router.get("/:userId/:skip/:limit", async(req, res) => {
  try{

    const chyper = `MATCH (loc:Location)<-[:LOCATED_AT]-(post:Post)<-[s:SHARED]-(u:User)
                    WHERE ID(loc) in $locations AND post IS NOT NULL
                    WITH loc,post,u,s
                    SKIP $skip
                    LIMIT $limit
                    CALL{
                      WITH post, loc, u
                      OPTIONAL MATCH (post)<-[like:LIKED]-(logUser:User)
                      WHERE ID(logUser)=$idU
                      RETURN count(like)>0 AS liked
                    }
                    RETURN collect([
                      id(post), post.image, post.commentNo, post.likeNo, post.description, liked,
                      id(u), u.username, u.firstName, u.lastName, u.image,
                      id(loc), loc.country, loc.city])
                      AS explorePost`

    const params = {idU: int(req.params.userId), skip: int(req.params.skip), limit: int(req.params.limit)}
    const locationsId = [];
    const keyNameSortedSet="explore:"+req.params.userId;

    const redis = await redisClient.getConnection();
    const count = await redis.sendCommand(["ZCOUNT", keyNameSortedSet, "-inf","+inf"]);
    let rangeTopLocation;
    if(count>0){
      rangeTopLocation="2";
      const locations= await redis.sendCommand(["ZRANGE",keyNameSortedSet,"0","4","REV"]);

      locations.forEach(el=>{
        locationsId.push(int(el))
      })
    }
    else
      rangeTopLocation="4";
    console.log("prvi put",locationsId)
    const topLocationsId = await redis.sendCommand(["ZRANGE","locations-leaderboard","0",rangeTopLocation,"REV"]);
    topLocationsId.forEach(el=>{
      locationsId.push(int(el.substring(el.indexOf(':')+1)))
    })
    console.log("drugi put",locationsId)
    params.locations=locationsId;
    const result=await session.run(chyper,params);
    const response = [];

    result.records[0].get('explorePost').forEach(post=>{
      response.push({
        post:{
          id: post[0].low,
          image: post[1],
          commentNo: post[2].low,
          likeNo: post[3].low,
          description: post[4],
          liked: post[5]
        },
        user: {
          id: post[6].low,
          username: post[7],
          firstName: post[8],
          lastName: post[9],
          image: post[10]
        },
        location:{
          id: post[11].low,
          country: post[12],
          city: post[13]
        }
      })

    })

    return res.send(response)
  }
  catch (ex) {
      console.log(ex);
      res.status(401).send("Došlo je do greške");
  }
})
module.exports = router;
