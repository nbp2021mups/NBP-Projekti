const driver = require('../neo4jdriver');
const express = require("express");
const router = express.Router();

const session = driver.session();

router.post("", async(req, res) => {
  try {
      const cypher = 'MATCH (u:User), (p:Post) WHERE id(u)=$userId AND id(p)=$postId MERGE (u)-[r:COMMENTED{comment: $comment}]->(p)'
      const params = { userId: req.body.userId, postId: req.body.postId, comment: req.body.comment }
      await session.run(cypher, params);
      return res.send("comment postavljen uspesno");
  } catch (ex) {
      console.log(ex)
      return res.status(401).send("Došlo je do greške");
  }
})

module.exports = router;
