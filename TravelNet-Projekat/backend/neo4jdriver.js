require("dotenv").config();
const neo4j = require('neo4j-driver');

const uri = process.env.NEO4J_URL;
const username = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

let driver = null;

const getConnection = () => {
    if (driver)
        return driver

    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    return driver
}

driver = getConnection();

module.exports = driver;