const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const ejs = require("ejs");
const db = require("./config/database");
const routes = require("./routes/route");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json()); 
app.use(session({
    secret: "My secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/", routes);

db.connect();

// app.get("/", (req, res) => {
//     res.redirect("/login");
// });

app.listen(PORT, ()=>{
    console.log(`Server listening on Port ${PORT}`)
})