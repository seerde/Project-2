const router = require("express").Router();
const User = require("../models/user.model");
const Art = require("../models/art.model");
const Order = require("../models/order.model");
const moment = require("moment");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/images");
  },
  filename: function(req, file, cb) {
    let fileExtension = path.extname(file.originalname).split(".")[1];
    cb(null, file.fieldname + "-" + Date.now() + "." + fileExtension);
  }
});

var upload = multer({ storage: storage });

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
    User.find().then(users => {
      response.render("home", { arts, moment, users });
    });
  });
});

//--- Post

router.post(
  "/auth/signup",
  upload.single("image"),
  [
    check("firstname").isLength({ min: 3 }),
    check("lastname").isLength({ min: 3 }),
    check("email").isEmail(),
    check("password").isLength({ min: 6 })
  ],
  (req, res, next) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      req.flash("autherror", errors.errors);
      return res.redirect("/auth/signup");
    }
    const file = req.file;
    if (!file) {
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      return next(error);
    }

    let user = new User(req.body);
    user.image = "/images/" + file.filename;

    user
      .save()
      .then(user => {
        let orderObj = {
          totalQty: 0,
          totalPrice: 0
        };
        if (user.userType == "user") {
          orderObj.user = user;
          let order = new Order(orderObj);
          order.save();
          user.order = order;
          user.save();
        }

        if (user.userType == "artist") {
          passport.authenticate("local", {
            successRedirect: "/art/create",
            successFlash: "Account created and Logged In!"
          })(req, res);
        } else {
          passport.authenticate("local", {
            successRedirect: "/home",
            successFlash: "Account created and Logged In!"
          })(req, res);
        }
      })
      .catch(err => {
        console.log(err);
        req.flash("error", "Email already exists!");
        return res.redirect("/auth/signup");
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
