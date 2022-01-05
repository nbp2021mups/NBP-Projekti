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
        if (req.body.locationId) {
            params.idL = req.body.locationId;
            cypher = 'MATCH (u:User), (l:Location) WHERE id(u)=$idU AND id(l)=$idL CREATE (u)-[r1:SHARED]->(p:Post {opis: $opis})-[r2:LOCATED_AT]->(l)'
        } else if (req.body.nazivLokacije) {
            params.naziv = req.body.nazivLokacije;
            cypher = 'MATCH (u:User) WHERE id(u)=$idU CREATE (u)-[r1:SHARED]->(p:Post {opis: $opis})-[r2:LOCATED_AT]->(l:Location {naziv: $naziv})'
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
        const postId = parseInt(req.params.postId)
        const cypher = 'MATCH (p:Post) WHERE id(p) = $id DETACH DELETE p'
            //DODATI BRISANJE KOMENTARA ZA OVU OBJAVU
            //BRISANJE LOKACIJE AKO NEMA POSLE BRISANJA NEMA OBJAVA NA TOJ LOKACIJI?
        await session.run(cypher, { id: postId });
        return res.send("Objava uspesno obrisana");
    } catch (ex) {
        console.log(ex)
        return res.status(401).send("Došlo je do greške");
    }
})

module.exports = router;