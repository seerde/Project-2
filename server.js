require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT;
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const authRoutes = require("./routes/auth.route");
const artRoutes = require("./routes/art.route");
const userRoutes = require("./routes/user.route");
const orderRoutes = require("./routes/order.route");

//const seniorRoutes = require("./routes/senior.route");
// const session = require("express-session");
const session = require("cookie-session");
const flash = require("connect-flash");
let passport = require("./config/passportConfig");

mongoose.connect(
  process.env.DB,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  },
  () => {
    console.log("mongodb running!");
  },
  err => {
    console.log(err);
  }
);

const server = express();

server.use(express.static("public"));
server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");
server.use(expressLayouts);

/*-- These must be place in the correct place */
server.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 360000 }
  })
);
//-- passport initialization
server.use(passport.initialize());
server.use(passport.session());
server.use(flash());

server.use(function (request, response, next) {
  // before every route, attach the flash messages and current user to res.locals
  response.locals.alerts = request.flash();
  response.locals.currentUser = request.user;
  next();
});

server.use(artRoutes);
server.use(authRoutes);
server.use(userRoutes);
server.use(orderRoutes);

server.get("/", (request, response) => {
  response.redirect("/home");
});

server.get("*", (request, response) => {
  response.send("Page not found");
});

server.listen(PORT, () => console.log(`connected to express on ${PORT}`));
