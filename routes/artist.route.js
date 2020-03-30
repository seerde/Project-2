const express = require('express')
const router = require("express").Router();
const mongoose = require('mongoose')
const moment = require('moment')
const methodOR = require('method-override')
const expressLayouts = require('express-ejs-layouts')
const formidable = require('formidable')

const User = require("../models/user.model");
// const Order = require("../models/order.model");
const passport = require("../config/passportConfig");
const isLoggedIn = require("../config/loginBlocker");
const { check, validationResult } = require("express-validator");

const fs = require('fs')



router.use(methodOR('_method'))
router.use(expressLayouts);

router.use(express.urlencoded({
    extended: true
}))

//--- Get
router.get("/artist/create", (request, response) => {
  response.render("artist/create");
});

router.get("/artist/index", (request, response) => {
  response.render("artist/index");
});

//--- Logout Route
router.get("/art/index", (request, response) => {
    request.logout(); //clear and break session
    request.flash("success", "Dont leave please come back!");
    response.redirect("/art/index");
  });
  
  router.get("/home", isLoggedIn, (request, response) => {
    response.render("home");
    //   Order.find().then(orders => {
    //     response.render("home", { orders });
    //   });
  });

  //--- Post

router.post(
    "/art/index",
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
        return response.redirect("/art/create");
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
          return response.redirect("/art/create");
        });
    }
  );

  router.post('/art/create', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
  
        const oldpath = files.filetoupload.path;
        const imagPath = '/images/' + files.filetoupload.name;
        const uploadpath = './public/images/' + files.filetoupload.name;
  
        fs.rename(oldpath, uploadpath, function (err) {
            if (err) throw err;
            else {
                fields.image = imagPath;
                let art = new art(fields);
                // food.push(fields.ingredients)
                //save food
                art
                    .save()
                    .then(() => {
                        res.redirect("/art");
                    })
                    .catch(err => {
                        console.log(err);
                        res.send("Error!!!!!");
                    });
            }
        });
    });
  })
  
  //-- Login Route
  router.post(
    "/artist/create",
    passport.artistenticate("local", {
      successRedirect: "/home", //after login success
      failureRedirect: "/art/index", //if fail
      failureFlash: "Invalid Username or Password",
      successFlash: "You have logged In!"
    })
  );
  
  module.exports = router;