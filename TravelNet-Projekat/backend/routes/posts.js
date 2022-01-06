const driver = require('../driver');
const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../storage");

const session = driver.session();

//dodavanje objave od strane korisnika ciji je id proslednjen
router.post("", async(req, res) => {
    try {
        //DODATI ZA SLIKU
        const params = { opis: req.body.opis, idU: req.body.userId }
        let cypher;
        if (req.body.drzava && req.body.grad) {
          console.log("Cao")
            params.drzava = req.body.drzava;
            params.grad = req.body.grad;
            cypher = 'MATCH (u:User), (l:Location) WHERE id(u)=$idU AND l.drzava=$drzava AND l.grad=$grad CREATE (u)-[r1:SHARED]->(p:Post {opis: $opis})-[r2:LOCATED_AT]->(l)'
        } else {
            params.drzava = req.body.drzava ? req.body.drzava : req.body.novaDrzava;
            params.grad = req.body.grad ? req.body.grad : req.body.noviGrad;
            cypher = 'MATCH (u:User) WHERE id(u)=$idU CREATE (u)-[r1:SHARED]->(p:Post {opis: $opis})-[r2:LOCATED_AT]->(l:Location {drzava: $drzava, grad: $grad, opis: $opis})'
        }

        await session.run(cypher, params);
        return res.send("Objava uspesno dodata");
    } catch (ex) {
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }
})

//promena opisa objave
router.patch("/:postId", async(req, res) => {
    try {
        const cypher = 'MATCH (p:Post) WHERE id(p) = $id SET p.opis = $noviOpis'
        const params = { id: parseInt(req.params.postId), noviOpis: req.body.noviOpis }
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
        /*const postId = parseInt(req.params.postId)
        const cypher = 'MATCH (p:Post)-[r:LOCATED_AT]->(l:Location) WHERE id(p) = $id DETACH DELETE p RETURN id(l)'

        const rez=await session.run(cypher, { id: postId });

        await session.run('MATCH (l:Location) WHERE id(l)=$id DELETE l', { id: rez.records[0].get('id(l)').low });*/

        return res.send("Objava uspesno obrisana");
    } catch (ex) {
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }
})

module.exports = router;
