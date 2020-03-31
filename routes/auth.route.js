const router = require("express").Router();
const User = require("../models/user.model");
const Art = require("../models/art.model");
const moment = require("moment");

// const Order = require("../models/order.model");
const passport = require("../config/passportConfig");
const isLoggedIn = require("../config/loginBlocker");
const { check, validationResult } = require("express-validator");

//--- Get

router.get("/auth/signup", (request, response) => {
  response.render("auth/signup");
});

router.get("/auth/signin", (request, response) => {
  response.render("auth/signin");
});

//--- Logout Route
router.get("/auth/logout", (request, response) => {
  request.logout(); //clear and break session
  request.flash("success", "Logged Out!");
  response.redirect("/auth/signin");
});

router.get("/home", isLoggedIn, (request, response) => {
  Art.find().then(arts => {
    response.render("home", { arts, moment });
  });
});

//--- Post
router.post(
  "/auth/signup",
  [
    check("firstname").isLength({ min: 3 }),
    check("lastname").isLength({ min: 3 }),
    check("email").isEmail(),
    check("password").isLength({ min: 6 })
  ],
  (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      request.flash("autherror", errors.errors);
      return response.redirect("/auth/signup");
    }
    let user = new User(request.body);
    user
      .save()
      .then(user => {
        // response.redirect("/home");
        if (user.userType == "artist") {
          passport.authenticate("local", {
            successRedirect: "/art/create",
            successFlash: "Account created and Logged In!"
          })(request, response);
        } else {
          passport.authenticate("local", {
            successRedirect: "/home",
            successFlash: "Account created and Logged In!"
          })(request, response);
        }
      })
      .catch(err => {
        console.log(err);
        request.flash("error", "Email already exists!");
        return response.redirect("/auth/signup");
      });
  }
);

//-- Login Route
router.post(
  "/auth/signin",
  passport.authenticate("local", {
    successRedirect: "/home", //after login success
    failureRedirect: "/auth/signin", //if fail
    failureFlash: "Invalid Username or Password",
    successFlash: "You have logged In!"
  })
);

module.exports = router;
