const driver = require('../neo4jdriver');
const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../storage");

const session = driver.session();

//dodavanje objave od strane korisnika ciji je id proslednjen
router.post("", async(req, res) => {
    try {
        //DODATI ZA SLIKU
        const params = { description: req.body.description, idU: req.body.userId, time: new Date().toString()}
        let cypher;
        if (req.body.country && req.body.city) {
            params.country = req.body.country;
            params.city = req.body.city;
            cypher = `MATCH (u:User), (l:Location)
                      WHERE id(u)=$idU AND l.country=$country AND l.city=$city
                      SET l.postsNo=l.postsNo+1, u.postsNo=u.postsNo+1
                      CREATE (u)-[r1:SHARED{time: $time}]->(p:Post {description: $description, likeNo:0, commentNo:0})-[r2:LOCATED_AT]->(l)`
        } else if ((req.body.country && req.body.newCity) || (req.body.newCountry && req.body.newCity) || (req.body.newCountry && req.body.city)){
            params.country = req.body.country ? req.body.country : req.body.newCountry;
            params.city = req.body.city ? req.body.city : req.body.newCity;
            cypher = `MATCH (u:User) WHERE id(u)=$idU
            CREATE (u)-[r1:SHARED{time: $time}]->(p:Post {description: $description, likeNo:0, commentNo:0})-[r2:LOCATED_AT]->(l:Location {country: $country, city: $city, postsNo:1, followersNo:0})`
        }
        else
          return res.status(401).send("Uneti podaci nisu validni, proverite ponovo.");

        await session.run(cypher, params);
        return res.send("Objava uspesno dodata");
    } catch (ex) {
        console.log(ex)
        return res.status(401).send("Država koju ste uneli već postoji na spisku lokacija, proverite ponovo unete podatke.");
    }
})

//promena opisa objave
router.patch("/:postId", async(req, res) => {
    try {
        const cypher = 'MATCH (p:Post) WHERE id(p) = $id SET p.description = $newDescription'
        const params = { id: parseInt(req.params.postId), newDescription: req.body.newDescription }
        await session.run(cypher, params);
        return res.send("Objava uspesno promenjena");
    } catch (ex) {
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }
})


//brisanje objave svih veza sa kojima je imala
router.delete("/:postId", async(req, res) => {
    try {
        const cypher = `MATCH (p:Post)-[r:LOCATED_AT]->(l:Location)
                        WHERE id(p) = $id
                        SET l.postsNo=l.postsNo-1, u.postsNo=u.postsNo-1
                        DETACH DELETE p
                        RETURN id(l)`
        const rez=await session.run(cypher, { id: parseInt(req.params.postId) });

        //brisanje lokacije ako nema vise veza ka njoj
        /* const cypher2= 'MATCH (l:Location) WHERE NOT ()-[:LOCATED_AT]->(l) AND id(l)=$id DETACH DELETE l'
        await session.run(cypher2, { id: rez.records[0].get('id(l)').low }); */

        return res.send("Objava uspesno obrisana");
    } catch (ex) {
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }
})

//vracanje ukupnog broja komentara i lajkova za konkretnu objavu
router.get("/:postId/reactions", async (req, res) =>{
  try {
    const cypher='MATCH (p:Post)<-[r]->() WHERE id(p) = $id AND (type(r)="LIKED" OR type(r)="COMMENTED") RETURN type(r), count(*)';
    const result=await session.run(cypher, { id: parseInt(req.params.postId) });
    const rez={
      likes: result.records[0].get('count(*)').low,
      comments: result.records[1].get('count(*)').low
    }
    return res.send(rez);
  } catch (ex) {
      console.log(ex)
      return res.status(401).send("Došlo je do greške");
  }
})

module.exports = router;
