const express = require("express");
const neo4j = require('neo4j-driver');

const uri = 'neo4j+s://472b9f78.databases.neo4j.io:7687';
const username = 'neo4j';
const password = '9dZcjmQYUwb0-R9NMztM4k8T0mtdEadIOgSvXZVGo1o';

const usersRoutes = require("./routes/users");
const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
const session = driver.session();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use("/users", usersRoutes);
module.exports = app;
