const router = require("express").Router();
const User = require("../models/user.model");
const Art = require("../models/art.model");
const Order = require("../models/order.model");
const express = require("express");

const isLoggedIn = require("../config/loginBlocker");
const isArtist = require("../config/isArtist");
const isUser = require("../config/isUser");
const { check, validationResult } = require("express-validator");
let formidable = require("formidable");

let fs = require("fs");

router.use(express.urlencoded({ extended: true }));

//--- Get
router.get("/order/show", isUser, (request, response) => {
  User.findById(request.user._id)
    .populate("order")
    .then(user => {
      Order.findById(user.order._id)
        .populate("arts")
        .then(order => {
          response.render("order/show", { order });
        });
    });
});

//--- Post
router.post("/order/add/:id", isUser, (request, response) => {
  let currentUser = request.user;
  User.findById(currentUser._id)
    .populate("order")
    .then(user => {
      Order.findById(user.order._id).then(order => {
        Art.findById(request.params.id).then(art => {
          order.totalPrice += art.price;
          order.totalQty += 1;
          order.arts.push(art);
          order.save();
          request.flash("success", "Added Art to Cart!");
          response.redirect("/home");
        });
      });
    });

  //   console.log(Order.findById(user.order));
  //   Order.populate("user")
  //     .find()
  //     .then(order => {
  //     //   let art = Art.findById(request.params.id);

  //     //   order.totalPrice += art.price;
  //     //   order.totalQty += 1;
  //     //   order.art.push(art);
  //     //   order.save();
  //     //   request.flash("success", "Added Art to Cart!");
  //     //   response.redirect("/home");
  //     });
});

module.exports = router;
