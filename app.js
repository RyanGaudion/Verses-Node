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


app.listen(WEB_PORT, () => {
console.log(`Verses app listening at http://localhost:${WEB_PORT}`);
});