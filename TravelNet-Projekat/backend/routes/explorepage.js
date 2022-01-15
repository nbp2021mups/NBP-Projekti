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

router.get("/:username", async(req, res) => {
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
});

module.exports = router;