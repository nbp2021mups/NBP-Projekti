const driver=require('../driver');
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const session=driver.session()

const MYME_TYPE_MAP = {
    "image/png": "png",
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
  };
  
const storage = multer.diskStorage({
destination: (req, file, cb) => {
    const isValid = MYME_TYPE_MAP[file.mimetype];
    let err;
    if (isValid)
        err = null;
    else
        err = new Error("Nevalidan mime type!");
    
    cb(err, "backend/images");
},
filename: (req, file, cb) => {
    const imgName = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MYME_TYPE_MAP[file.mimetype];
    cb(null, imgName + "-" + Date.now() + "." + ext);
},
});

//registracija 
router.post("/register", multer({ storage: storage }).single("image"), async (req,res)=>{
    
    if (req.body.ime == null || req.body.prezime == null || req.body.email == null || req.body.username==null || req.body.lozinka == null)
        return res.status(409).send("Niste uneli validne podatke, proverite ponovo.");
      
    const hesiranaLozinka = await bcrypt.hash(req.body.lozinka, 12);
    const imeKlijenta = req.body.ime.charAt(0).toUpperCase() + req.body.ime.slice(1);
    const prezimeKlijenta = req.body.prezime.charAt(0).toUpperCase() + req.body.prezime.slice(1);
    const url = req.protocol + "://" + req.get("host");
    let putanjaSlike = url + "/images/";
    if (req.file) 
        putanjaSlike += req.file.filename;
    else
        putanjaSlike += "universal.jpg";
    
    try{
        let cypher='CREATE (a:User {ime: $ime, prezime: $prezime, email: $email, username: $username, lozinka: $lozinka, slika: $slika';
        const params= { ime: imeKlijenta,
            prezime: prezimeKlijenta,
            email:req.body.email,
            username: req.body.username,
            lozinka: hesiranaLozinka,
            slika: putanjaSlike
        }

        if (req.body.opis){
            cypher+=', opis: $opis';
            params.opis= req.body.opis;
        }            
        cypher+='})';
        await session.run(cypher, params);

        return res.send("Uspesno registrovan")
        }
    catch (ex){
    if(ex.message.includes('email'))
        return res.status(409).send("Postoji email");
    else
        return res.status(409).send("Postoji username");       
    }
})

//logovanje
router.post("/login", async (req,res) =>{
    try{
        const result=await session.run('MATCH (u:User {username: $username}) RETURN u.lozinka, id(u)', { username: req.body.username });
        if(result.records.length==0)
            return res.status(401).send("Greska pri logovanju");//ne postoji nalog sa ovim username-om
        
        const userPassword=result.records[0].get(0);
        const userId= result.records[0].get(1).low;         
        const isCorrect = await bcrypt.compare(req.body.lozinka, userPassword);
    
        if(isCorrect){
            const token = jwt.sign(
                {
                username: req.body.username,
                id: userId
                },
                "token",
                { expiresIn: "1h" }
            );
            return res.send({id: userId, token: token, trajanjeTokena: 60});
        }
        else 
            return res.status(401).send("Greska pri logovanju")   
        
    }
    catch{
        return res.status(401).send("Greska pri logovanju");
    }
    
})

//promena slike, username-a, lozinke, opisa profila
router.patch("/:id", multer({ storage: storage }).single("image"), async (req,res)=>{
    try{
        let chyper='';
        const params= new Object()
        params.id=parseInt(req.params.id)        
        
        if (req.body.slika){
            params.username=req.body.slika
            chyper='u.slika = $slika'            
        }            
        if (req.body.username){            
            if(chyper)
                chyper+=', '                
            chyper+='u.username = $username'
            params.username=req.body.username            
        }
            
        if (req.body.lozinka && req.body.novaLozinka){
            const result=await session.run('MATCH (u:User) WHERE id(u)=$id RETURN u.lozinka', { id: parseInt(req.params.id) });
            const isValid = await bcrypt.compare(req.body.lozinka, result.records[0].get(0));
            if (isValid){
                const hesiranaLozinka = await bcrypt.hash(req.body.novaLozinka, 12);
                if (chyper)
                    chyper+=', '
                chyper+='u.lozinka = $lozinka'
                params.lozinka=hesiranaLozinka                      
            }                
            else
                return res.status(305).send("Uneta lozinka se ne poklapa sa trenutnom lozinkom, proverite unete podatke.");            
        }

        if (req.body.opis){
            if (chyper)
                chyper+=', '
            chyper+='u.opis = $opis'
            params.opis=req.body.opis
        }
        if (req.file){
            const url = req.protocol + "://" + req.get("host");
            let putanjaSlike = url + "/images/" + req.file.filename;
            if (chyper)
                chyper+=', '
            chyper+='u.slika = $slika'
            params.slika = putanjaSlike
            
        }
        await session.run('MATCH (u:User) WHERE id(u)=$id SET '+ chyper, params);        
        return res.send("Uspesno azuriranje")
    }       
    catch(ex){
        if(ex.message.includes('username'))       
            return res.status(409).send("Postoji nalog sa ovim username-om");      
        return res.status(409),send("Doslo je do greske prilikom azuriranja!");        
    }
})

module.exports = router;