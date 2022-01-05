const driver = require('../driver');
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const storage = require("../storage");
const path = require("path");

const session = driver.session();
const router = express.Router();

// Routes
router.get('/', async(req, res) => {
    try {

    } catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});


module.exports = router;