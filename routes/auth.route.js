const router = require("express").Router();
const User = require("../models/user.model");
// const Order = require("../models/order.model");
const passport = require("../config/passportConfig");
const isLoggedIn = require("../config/loginBlocker");
const { check, validationResult } = require("express-validator");
let formidable = require("formidable");

let fs = require("fs");

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
  response.render("home");
  //   Order.find().then(orders => {
  //     response.render("home", { orders });
  //   });
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
    var form = new formidable.IncomingForm();
    form.parse(request, function(err, fields, files) {
      request.body = fields;
      var oldpath = files.image.path;
      var imagPath = "/images/" + files.image.name;
      var uploadpath = "./public/images/" + files.image.name;

      fs.rename(oldpath, uploadpath, function(err) {
        if (err) throw err;
        else {
          const errors = validationResult(fields);
          if (!errors.isEmpty()) {
            request.flash("autherror", errors.errors);
            return response.redirect("/auth/signup");
          }
          fields.image = imagPath;
          // console.log(fields);
          let user = new User(fields);
          user
            .save()
            .then(user => {
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
      });
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
