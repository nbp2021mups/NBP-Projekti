const driver=require('../driver');
const express = require("express");
const router = express.Router();

const session=driver.session();

//slanje zahteva za prijateljstvo(u1 salje u2 zahtev)
router.post("/request", async (req,res) =>{
    try{
        const cypher = 'MATCH (u1:User), (u2:User) WHERE id(u1)=$id1 AND id(u2)=$id2 MERGE (u1)-[r:SENT_REQUEST]->(u2)'
        const params = { id1 : req.body.id1, id2 : req.body.id2}
        await session.run(cypher, params);
        return res.send("Zahtev poslat uspesno");  
    }
    catch (ex){
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }
    
})

//brisanje zahteva za prijateljstvo(brise se zahtev koji je u1 poslao u2)
router.delete("/request", async (req,res) =>{
    try{
        const cypher = 'MATCH (u1:User)-[r:SENT_REQUEST]->(u2:User) WHERE id(u1)=$id1 AND id(u2)=$id2 DELETE r'
        const params = { id1 : req.body.id1, id2 : req.body.id2}
        await session.run(cypher, params);
        return res.send("Zahtev obrisan uspesno");  
    }
    catch (ex){
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }
    
})

/* MATCH (u1:User)-[rel:`NEW-TYPE2`]->(u2:User)
CALL apoc.refactor.setType(rel, 'SENT_REQUEST')
YIELD input, output
RETURN input, output */

module.exports = router;