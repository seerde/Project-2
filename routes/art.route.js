const router = require("express").Router();
const User = require("../models/user.model");
const Art = require("../models/art.model");
const express = require("express");

const isLoggedIn = require("../config/loginBlocker");
const isArtist = require("../config/isArtist");
const { check, validationResult } = require("express-validator");
let formidable = require("formidable");

let fs = require("fs");

router.use(express.urlencoded({ extended: true }));

//--- Get
router.get("/art/create", isArtist, (request, response) => {
  response.render("art/create");
});



//--- Post
router.post("/artist/<%= artist._id%>", isArtist, (request, response) => {
  var form = new formidable.IncomingForm();
  form.parse(request, function(err, fields, files) {
    var oldpath = files.image.path;
    var imagPath = "/images/" + files.image.name;
    var uploadpath = "./public/images/" + files.image.name;

    fs.rename(oldpath, uploadpath, function(err) {
      if (err) throw err;
      else {
        fields.image = imagPath;
        let currentUser = request.user;
        let art = new Art(fields);
        art.user = currentUser;
        User.findById(currentUser._id, (err, user) => {
          user.art.push(art);
          user.save();
        });
        art
          .save()
          .then(() => {
            request.flash("success", "Art Posted!");
            response.redirect("/home");
          })
          .catch(err => {
            console.log(err);
            response.send("Error!!!!!");
          });
      }
    });
  });
});



module.exports = router;
