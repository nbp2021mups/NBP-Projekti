require("dotenv").config();
const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../storage");
const { int } = require('neo4j-driver');
const driver = require('../neo4jdriver');
const session = driver.session();
const redisClient = require('../redisclient');
const { json } = require("stream/consumers");

//PROSTOR ZA METODE

/* router.get("/:username", async(req, res) => {
    try {
        const client = await redisClient.getConnection();
        const listExist = await client.sendCommand(["EXISTS","explorePagePosts"]);
        let listaobjava = [];
        if(listExist == 0)
        {
            const cypher =`MATCH (u:User)-[r1:SHARED]->(p:Post)-[r:LOCATED_AT]->(l:Location)
            WHERE l.country IN ['Tuska', 'Francuska']
            CALL{
                            WITH p
                            OPTIONAL MATCH (u1:User{username:$username})-[r2:LIKED]->(p)
                            RETURN count(p)>0 as liked
                    }
            RETURN id(p),p.description,p.image,p.commentNo,p.likeNo,
            id(l),l.city,l.country,
            id(u),u.firstName,u.lastName,u.username,u.image,
            liked`;
            const params = {
                username: req.params.username
            };
            const postsList = await session.run(cypher,params);
            postsList.records.forEach(async record => {
                objava = {
                    id: record.get(0).low,
                    description: record.get(1),
                    image: record.get(2),
                    commentNo: record.get(3).low,
                    liked: record.get(13),
                    likesNo: record.get(4).low,
                    location:
                    {
                        id:record.get(5).low,
                        city:record.get(6),
                        coutnry:record.get(7)
                    },
                    user:{
                        id:record.get(8).low,
                        firstName: record.get(9),
                        lastName: record.get(10),
                        username: record.get(11),
                        image: record.get(12)
                    }

                }
                var stringPost = JSON.stringify(objava);
                await client.sendCommand(["RPUSH","explorePagePosts",stringPost]);
            });
        }
        i=0;
        listLen = await client.sendCommand(['LLEN','explorePagePosts'])
        while(i< listLen){
            redisObjava = await client.sendCommand(["LRANGE","explorePagePosts",String(i),String(i)]);
            i++;
            jsonObjava = JSON.parse(redisObjava);
            listaobjava.push(jsonObjava);
        }
        return res.send(listaobjava);
    }
    catch (ex) {
        console.log(ex);
        res.status(401).send("Došlo je do greške");
    }
}); */


router.get("/:userId/:limit", async(req, res) => {
  try{
    //lista id lokacija
    //ako je lista prazna, po broju lajkova sa top lokacija, start index, count
    //count minus broj lokacija koje su vracene
    const chyper = `MATCH (loc:Location)
                      WHERE ID(loc) in $locations
                      OPTIONAL MATCH (loc)<-[:LOCATED_AT]-(post:Post)<-[s:SHARED]-(u:User)
                      WITH loc,post,u,s
                      LIMIT $limit
                      CALL{
                        WITH post, loc, u
                        OPTIONAL MATCH (post)<-[like:LIKED]-(logUser:User)
                        WHERE ID(logUser)=$idU
                        RETURN count(like)>0 AS liked
                      }
                      CALL{
                        WITH u
                        OPTIONAL MATCH (logUser:User)-[friend:IS_FRIEND]->(u)
                        WHERE ID(logUser)=$idU
                        RETURN count(friend)>0 AS isFriend
                      }
                      RETURN collect([id(loc), loc.country, loc.city, post, u, liked, isFriend])`
    const params = {idU: int(req.params.userId), limit: int(req.params.limit)}
    const locationsId = [];
    const keyNameSortedSet="explore:"+req.params.userId;

    const redis = await redisClient.getConnection();
    const count = await redis.sendCommand(["ZCOUNT", keyNameSortedSet, "-inf","+inf"]);
    if(count>0){
      const locations= await redis.sendCommand(["ZRANGE",keyNameSortedSet,"0","4","REV"]);

      locations.forEach(el=>{
        locationsId.push(int(el))
      })

    }
    const topLocationsId = await client.sendCommand(["ZRANGE","locations-leaderboard","0","1","REV","WITHSCORES"]);
    topLocationsId.forEach(el=>{
      locationsId.push(int(el))
    })

    params.locations=locationsId;
    const result=await session.run(chyper,params);
    console.log(result.records[0])
    return res.send(result.records[0])
  }
  catch (ex) {
      console.log(ex);
      res.status(401).send("Došlo je do greške");
  }

})
module.exports = router;
