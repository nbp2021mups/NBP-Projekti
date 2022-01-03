const driver=require('../driver');
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");


const session=driver.session()

/* router.get("/:name",async(req,res)=>{
    try {
        
        const result = await session.run(
            'MATCH (p:Person {name:$name}) RETURN p', { name: req.params.name }
        );
        console.log("Result", result);
        console.log("Records", result.records);
  
        const singleRecord = result.records[0];
        console.log("First record", singleRecord);
  
        const node = singleRecord.get(0);
        console.log("Node", node);
  
        console.log("Properties", node.properties);
        console.log(node.properties.name);
    } finally {
        await session.close();
    }
}) */

router.post("/register",async (req,res)=>{
    
    if (req.body.ime == null || req.body.prezime == null || req.body.email == null || req.body.username==null || req.body.lozinka == null){
        return res.status(409).send("Niste uneli validne podatke, proverite ponovo.");
      }
      const hesiranaLozinka = await bcrypt.hash(req.body.lozinka, 12);
      const imeKlijenta = req.body.ime.charAt(0).toUpperCase() + req.body.ime.slice(1);
      const prezimeKlijenta = req.body.prezime.charAt(0).toUpperCase() + req.body.prezime.slice(1);
      try{
        let cypher='CREATE (a:User {ime: $ime, prezime: $prezime, email: $email, username: $username, lozinka: $lozinka';
        console.log(cypher)
        const params= { ime: imeKlijenta,
            prezime: prezimeKlijenta,
            email:req.body.email,
            username: req.body.username,
            lozinka: hesiranaLozinka }

        if (req.body.opis){
            cypher+=', opis: $opis';
            params.opis= req.body.opis;
        }            
        cypher+='})';
        await session.run(cypher, params);

        res.send("Uspesno registrovan")
      }
      catch (exp){

        if(exp.message.includes('email'))
            res.status(409).send("Postoji email");
        else
            res.status(409).send("Postoji username");       
      }
})

module.exports = router;