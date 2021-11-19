require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
app.set("view engine", "ejs");

const { WEB_PORT } = process.env;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/history", (req, res) => {
    res.render("history");
});

app.get("/stats", (req, res) => {
    res.render("stats");
});

app.get("/record", (req, res) => {
    res.render("record");
});

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.listen(WEB_PORT, () => {
console.log(`Verses app listening at http://localhost:${WEB_PORT}`);
});