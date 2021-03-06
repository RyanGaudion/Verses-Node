require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const User = require('./models/User');
app.set("view engine", "ejs");

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 8080;

const userController = require("./controllers/user");
const recordController = require("./controllers/record");
const bookApiController = require("./controllers/api/book");


//Connect to DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on("error", (err) => {
  console.error(err);
  console.log(
    "MongoDB connection error. Please make sure MongoDB is running.",
    chalk.red("✗")
  );
  process.exit();
});

//Add Req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Add public css directory
app.use(express.static(path.join(__dirname, "public")));

//Add user session
app.use(expressSession({ secret: 'SuperSecretSessionSecret123!', cookie: { expires: new Date(253402300000000) } }))

//Add Glboal User & page authorisation
app.use("*", async (req, res, next) => {
    global.user = false;
    if (req.session.userID && !global.user) {
      const user = await User.findById(req.session.userID);
      global.user = user;
    }
    next();
  })
  
const authMiddleware = async (req, res, next) => {
    const user = await User.findById(req.session.userID);
    if (!user) {
        return res.redirect('/login');
    }
    next()
}

app.get("/", authMiddleware, (req, res) => {
    res.render("index", {_pageName: "index"});
});

app.get("/history", authMiddleware, recordController.search);

app.get("/stats", authMiddleware, recordController.stats);

app.get("/record", authMiddleware, recordController.record);

app.post("/createRecord", authMiddleware, recordController.create);
app.post("/deleteRecord", authMiddleware, recordController.delete);

app.get("/login", (req, res) => {
    var reqMessage = req.query.message;
    if(reqMessage){
        res.render("login", { _pageName: "login", errors: {}, message: reqMessage });
    }
    else{
        res.render("login", { _pageName: "login", errors: {}, message: null });
    }

})
app.post("/login", userController.login);

app.get("/register", (req, res) => {
    res.render("register", { _pageName: "register", errors: {} });
})
app.post("/register", userController.register);

app.get("/logout", async (req, res) => {
    req.session.destroy();
    global.user = false;
    res.redirect('/login');
});

//API endpoints
app.get("/api/book/getall", bookApiController.list);

app.listen(PORT, () => {
    console.log(`Verses app listening at http://localhost:${PORT}`);
});