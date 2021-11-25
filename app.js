require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
app.set("view engine", "ejs");

const { PORT, MONGODB_URI } = process.env;

const userController = require("./controllers/user");


mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on("error", (err) => {
  console.error(err);
  console.log(
    "MongoDB connection error. Please make sure MongoDB is running.",
    chalk.red("✗")
  );
  process.exit();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(expressSession({ secret: 'SuperSecretSessionSecret123!', cookie: { expires: new Date(253402300000000) } }))

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
    res.render("login", { errors: {}, message: {} });
})
app.post("/login", userController.login);

app.get("/register", (req, res) => {
    res.render("register", { errors: {} });
})
app.post("/register", userController.register);


app.listen(PORT, () => {
console.log(`Verses app listening at http://localhost:${PORT}`);
});