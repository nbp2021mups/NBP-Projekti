const express = require("express");
const path=require("path");

const usersRoutes = require("./routes/users");
const postsRoutes= require("./routes/posts");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/images",express.static(path.join("backend/images")));

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
app.use("/posts",postsRoutes)

module.exports = app;
