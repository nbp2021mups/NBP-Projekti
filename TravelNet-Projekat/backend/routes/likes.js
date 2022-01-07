const driver = require('../neo4jdriver');
const express = require("express");
const router = express.Router();

const session = driver.session();


router.post("", async(req, res) => {
  try {
      const cypher = 'MATCH (u:User), (p:Post) WHERE id(u) = $userId AND id(p) = $postId MERGE (u)-[r:LIKED]->(p)'
      const params = { userId: req.body.userId, postId: req.body.postId }
      await session.run(cypher,params);
      return res.send("Lajk!");
  } catch (ex) {
      console.log(ex)
      return res.status(401).send("Došlo je do greške");
  }
})

router.delete("/:likeId", async(req, res) => {
  try {
      const cypher = 'MATCH ()-[r]-() WHERE id(r)=$id DELETE r'
      const params = { id : parseInt(req.params.likeId)}
      await session.run(cypher,params);
      return res.send("Lajk obrisan uspesno");
  } catch (ex) {
      console.log(ex)
      return res.status(401).send("Došlo je do greške");
  }
})

module.exports = router;
