const express = require("express");
const path = require("path");

const usersRoutes = require("./routes/users");
const postsRoutes = require("./routes/posts");
const friendsRoutes = require("./routes/friends");
const messageRoutes = require("./routes/messages");
const notificationRoutes = require("./routes/notifications");
const commentsRoutes = require("./routes/comments");
const likesRoutes = require("./routes/likes");
const locationsRoutes = require("./routes/locations");
const leaderboardsRoutes = require("./routes/leaderboards")

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/images", express.static(path.join("backend/images")));

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
app.use("/posts", postsRoutes);
app.use("/friends", friendsRoutes);
app.use("/notifications", notificationRoutes);
app.use("/messages", messageRoutes);
app.use("/comments", commentsRoutes);
app.use("/likes", likesRoutes);
app.use("/locations", locationsRoutes);
app.use("/leaderboards", leaderboardsRoutes);

module.exports = app;
