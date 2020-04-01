const router = require("express").Router();
const User = require("../models/user.model");
const Art = require("../models/art.model");
const express = require("express");
const methodOverride = require("method-override");
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

const isLoggedIn = require("../config/loginBlocker");
const isArtist = require("../config/isArtist");
const { check, validationResult } = require("express-validator");

let updateArt = "";
let showArt = "";

router.use(express.urlencoded({ extended: true }));
router.use(methodOverride("_method"));

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
router.get("/art/list", isLoggedIn, (request, response) => {
  Art.find().then(arts => {
    response.render("art/list", { arts });
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

router.post(
  "/art/update/final/:id",
  upload.single("image"),
  (request, response, next) => {
    Art.findById(request.params.id).then(art => {
      const file = request.file;
      if (file) {
        art.image = "/images/" + file.filename;
        art.title = request.body.title;
        art.description = request.body.description;
        art.price = request.body.price;
        art.save();
        request.flash("success", "Art Updated!");
        response.redirect("/home");
      } else {
        art.title = request.body.title;
        art.description = request.body.description;
        art.price = request.body.price;
        art.save();
        request.flash("success", "Art Updated!");
        response.redirect("/home");
      }
    });
  }
);

router.post("/art/create/:id", upload.single("image"), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  let currentUser = req.user;
  let art = new Art(req.body);
  art.image = "/images/" + file.filename;
  art.user = currentUser;
  User.findById(currentUser._id, (err, user) => {
    user.art.push(art);
    user.save();
  });
  //save author
  art
    .save()
    .then(() => {
      req.flash("success", "Art Posted!");
      res.redirect("/home");
    })
    .catch(err => {
      console.log(err);
      res.send("Error!!!!!");
    });
});

router.delete("/art/:id/delete", (request, response) => {
  User.findById(request.user._id)
    .populate("art")
    .then(user => {
      let index = 0;
      user.art.forEach((art, i) => {
        if (art._id == request.params.id) {
          index = i;
        }
      });
      user.art.splice(index, 1);
      user.save();
      Art.findByIdAndDelete(request.params.id).then(() => {
        request.flash("success", "Art Deleted!");
        response.redirect("/home");
      });
    });
});

module.exports = router;
