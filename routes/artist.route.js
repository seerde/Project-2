const router = require("express").Router();
const User = require("../models/user.model");
// const Order = require("../models/order.model");
const passport = require("../config/passportConfig");
const isLoggedIn = require("../config/loginBlocker");
const { check, validationResult } = require("express-validator");

//--- Get
router.get("/artist/create", (request, response) => {
  response.render("artist/create");
});

router.get("/artist/index", (request, response) => {
  response.render("artist/index");
});

//--- Logout Route
router.get("/artist/index", (request, response) => {
    request.logout(); //clear and break session
    request.flash("success", "Dont leave please come back!");
    response.redirect("/artist/index");
  });
  
  router.get("/home", isLoggedIn, (request, response) => {
    response.render("home");
    //   Order.find().then(orders => {
    //     response.render("home", { orders });
    //   });
  });

  //--- Post

router.post(
    "/artist/index",
    [
      check("firstname").isLength({ min: 3 }),
      check("lastname").isLength({ min: 3 }),
      check("email").isEmail(),
      check("password").isLength({ min: 6 }),
    ],
    (request, response) => {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        request.flash("artisterror", errors.errors);
        return response.redirect("/artist/create");
      }
      let user = new User(request.body);
      user
        .save()
        .then(() => {
          // response.redirect("/home");
          passport.artistenticate("local", {
            successRedirect: "/home",
            successFlash: "Account created and Logged In!"
          })(request, response);
        })
        .catch(err => {
          console.log(err);
          request.flash("error", "Email already exists!");
          return response.redirect("/artist/create");
        });
    }
  );
  
  //-- Login Route
  router.post(
    "/artist/create",
    passport.authenticate("local", {
      successRedirect: "/home", //after login success
      failureRedirect: "/artist/index", //if fail
      failureFlash: "Invalid Username or Password",
      successFlash: "You have logged In!"
    })
  );
  
  module.exports = router;