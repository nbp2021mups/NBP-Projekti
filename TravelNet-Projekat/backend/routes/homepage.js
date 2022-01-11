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
        // REDIS CODE AND CHECKING 
        const client = await redis.getConnection();
        const setExist = await client.sendCommand(["EXISTS","locations-leaderboard"]);

        // IF NOT EXIST 
        const cypher = `MATCH(u1:User{username: $username})-[r1:IS_FRIEND]->(u2:User)-[r2:SHARED]->(p:Post)-[r3:LOCATED_AT]->(l:Location) 
        RETURN id(p),p.description,p.image,p.commentNo,p.likeNo,id(l),l.city,l.country,
        id(u2),u2.firstName,u2.lastName,u2.username,u2.image`;
        const params = {
            username: req.params.username
        };
        let listaobjava = [];
        const postsList = await session.run(cypher,params);
        postsList.records.forEach(record => {
        objava = {
            id: record.get(0).low,
            description: record.get(1),
            image: record.get(2),
            commentNo: record.get(3).low,
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
        listaobjava.push(objava);

        // REDIS LIST ADD OBJAVA JSON.STRINGIFY
    });
        res.send(postsList);

        // REDIS GET ELEMENT FROM LIST ( STRING )
        // STRING JSON.PARSE TO GET JSON OBJECT
        // SEND JSON OBJECT TO FRONT
    } catch (ex) {
        console.log(ex);
        res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;