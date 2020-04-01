const router = require("express").Router();
const User = require("../models/user.model");
const Art = require("../models/art.model");
const express = require("express");

const isLoggedIn = require("../config/loginBlocker");
const isArtist = require("../config/isArtist");
const { check, validationResult } = require("express-validator");
let formidable = require("formidable");

let fs = require("fs");
let updateArt = "";
let showArt = "";

router.use(express.urlencoded({ extended: true }));

//--- Get
router.get("/art/show/:id", (request, response) => {
  showArt = request.params.id;
  response.redirect("/art/show");
});
router.get("/art/show", (request, response) => {
  Art.findById(showArt).then(art => {
    response.render("art/show", { art });
  });
});

router.get("/art/create", isArtist, (request, response) => {
  response.render("art/create");
});
router.get("/art/update", isArtist, (request, response) => {
  Art.findById(updateArt).then(art => {
    response.render("art/update", { art });
  });
});

//--- Post
router.post("/art/update/:id", isArtist, (request, response) => {
  updateArt = request.params.id;
  response.redirect("/art/update");
});

router.post("/art/update/final/:id", isArtist, (request, response) => {
  var form = new formidable.IncomingForm();
  form.parse(request, function(err, fields, files) {
    Art.findById(request.params.id).then(art => {
      if (files.image.name) {
        var oldpath = files.image.path;
        var imagPath = "/images/" + files.image.name;
        var uploadpath = "./public/images/" + files.image.name;
        fs.rename(oldpath, uploadpath, function(err) {
          if (err) throw err;
          else {
            fields.image = imagPath;
            art.image = fields.image;
            art.title = fields.title;
            art.description = fields.description;
            art.price = fields.price;
            art.save();
            request.flash("success", "Art Updated!");
            response.redirect("/home");
          }
        });
      } else {
        art.title = fields.title;
        art.description = fields.description;
        art.price = fields.price;
        art.save();
        request.flash("success", "Art Updated!");
        response.redirect("/home");
      }
    });
  });
});

router.post("/art/create/:id", isArtist, (request, response) => {
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
