const driver = require('../neo4jdriver');
const express = require("express");
const router = express.Router();

const session = driver.session();

router.post("", async(req, res) => {
  try {
      const cypher = 'MATCH (u:User), (p:Post) WHERE id(u)=$iuserId AND id(p)=$postId MERGE (u)-[r:COMMENTED{comment: $komentar}]->(p)'
      const params = { userId: req.body.userId, postId: req.body.postId, komentar: req.body.komentar }
      await session.run(cypher, params);
      return res.send("Komentar postavljen uspesno");
  } catch (ex) {
      console.log(ex)
      return res.status(401).send("Došlo je do greške");
  }
})

module.exports = router;
