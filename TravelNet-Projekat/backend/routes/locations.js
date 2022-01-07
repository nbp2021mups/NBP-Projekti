const driver = require('../neo4jdriver');
const express = require("express");
const router = express.Router();

const session = driver.session();

//korisnik zapracuje lokaciju
router.post("/follow", async (req, res)=>{

  try {
    const cypher='MATCH (u:User), (l:Location) WHERE id(u) = $userId AND id(l) = $locationId MERGE (u)-[r:FOLLOWS]->(l)'
    await session.run(cypher, { userId: req.body.userId, locationId: req.body.locationId})
    return res.send("Lokacija je zapraćena")
  } catch (ex) {
      console.log(ex)
      return res.status(401).send("Došlo je do greške");
  }

})

//korisnik otpracuje lokaciju
router.delete("/:relId/unfollow", async (req, res)=>{
  try {
    const cypher='MATCH ()-[r]-() WHERE id(r)=$id DELETE r'
    await session.run(cypher, { id: parseInt(req.params.relId)})
    return res.send("Lokacija je otpraćena")
  } catch (ex) {
      console.log(ex)
      return res.status(401).send("Došlo je do greške");
  }

})

module.exports = router;
