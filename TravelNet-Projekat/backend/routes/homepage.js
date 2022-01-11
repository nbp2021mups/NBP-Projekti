require("dotenv").config();
const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../storage");
const { int } = require('neo4j-driver');
const driver = require('../neo4jdriver');
const session = driver.session()
const redisClient = require('../redisclient');

router.get("/:username", async(req, res) => {
    try {
        const client = await redisClient.getConnection();
        const listExist = await client.sendCommand(["EXISTS","homepagePosts"]);
        let listaobjava = [];
        if(listExist == 0)
        {
        const cypher = `MATCH(u1:User{username: $username})-[r1:IS_FRIEND]->(u2:User)-[r2:SHARED]->(p:Post)-[r3:LOCATED_AT]->(l:Location) 
        CALL{
                WITH u1,p
                MATCH (u1)-[r4:LIKED]->(p)
                RETURN count(p)>0 as liked
        }
        RETURN id(p),p.description,p.image,p.commentNo,p.likeNo,id(l),l.city,l.country,
        id(u2),u2.firstName,u2.lastName,u2.username,u2.image,liked`;
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
        await client.sendCommand(["RPUSH","homepagePosts",stringPost]);
    });
}

        //redisList = await client.sendCommand(["RPUSH","homepagePosts",stringPost]);
        i=0;
        listLen = await client.sendCommand(['LLEN','homepagePosts'])
        while(i< listLen){
            redisObjava = await client.sendCommand(["LRANGE","homepagePosts",String(i),String(i)]);
            i++;
            jsonObjava = JSON.parse(redisObjava);
            listaobjava.push(jsonObjava);
        } 
        res.send(listaobjava);
    } catch (ex) {
        console.log(ex);
        res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;