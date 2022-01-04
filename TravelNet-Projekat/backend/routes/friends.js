const driver=require('../driver');
const express = require("express");
const router = express.Router();

const session=driver.session();

//slanje zahteva za prijateljstvo(u1 salje u2 zahtev)
router.post("/request", async (req, res) =>{
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

//brisanje zahteva za prijateljstvo(u1 brise zahtev ili u2 odbija zahtev)
router.delete("/request", async (req, res) =>{
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

//prihvatanje zahteva za prijateljstvo(u2 prihvata u1)
router.post("/accept",async (req, res)=> {
  try{
      const cypher1 = 'MATCH (u1:User), (u2:User) WHERE id(u1)=$id1 AND id(u2)=$id2 MERGE (u2)-[r:IS_FRIEND]->(u1)'
      const params = { id1 : req.body.id1, id2 : req.body.id2}
      await session.run(cypher1, params);
      let cypher2 =
      'MATCH (u1:User)-[r:SENT_REQUEST]->(u2:User) WHERE id(u1)=$id1 AND id(u2)=$id2 '+
      'CALL apoc.refactor.setType(r, "IS_FRIEND") '+
      'YIELD input, output '+
      'RETURN input, output';
      await session.run(cypher2,params);
      return res.send("Zahtev je prihvacen")
  }
  catch (ex){
      console.log(ex)
      return res.status(401).send("Došlo je do greške");
  }

})

//brisanje prijatelja
router.delete("", async (req, res) =>{
  try{
    const cypher = 'MATCH (u1:User)-[r:IS_FRIEND]-(u2:User) WHERE id(u1)=$id1 AND id(u2)=$id2 DELETE r'
    const params = { id1 : req.body.id1, id2 : req.body.id2}
    await session.run(cypher, params);
    return res.send("Brisanje prijatelja je uspesno")
  }
  catch (ex){
    console.log(ex)
    return res.status(401).send("Došlo je do greške");
  }
})


module.exports = router;
