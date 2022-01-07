const driver = require('../neo4jdriver');
const express = require("express");
const router = express.Router();

const session = driver.session();

module.exports = router;
