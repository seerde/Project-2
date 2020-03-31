const router = require("express").Router();
const User = require("../models/user.model");
const passport = require("../config/passportConfig");
const isLoggedIn = require("../config/loginBlocker");
const { check, validationResult } = require("express-validator");

//--- Get

router.get("/user/index", isLoggedIn, (request, response) => {
  response.render("user/index");
});

router.get("/user/update", isLoggedIn, (request, response) => {
  response.render("user/update");
});

router.get("/user/updateInformation", isLoggedIn, (request, response) => {
  response.render("user/updateInformation");
});

router.get("/auth/home", isLoggedIn, (request, response) => {
  response.render("/auth/home");
});

router.post(
  "/user/update/:id",
  [check("newEmail").isEmail(), check("newPassword").isLength({ min: 6 })],
  (request, response) => {
    console.log(request.body);
    let updateObj = { email: request.body.newEmail };
    if (request.body.newPassword == request.body.reNewPassword) {
      updateObj.password = request.body.newPassword;
    }
    User.findById(request.params.id).then(user => {
      user.email = updateObj.email;
      user.password = updateObj.password;
      user.save();
      request.logout();
      request.flash("updated", "Updated. Please Signin again!");
      response.redirect("/auth/signin");
    });
  }
);
router.post(
  "/user/updateInformation/:id",
  [check("Newfirstname").isLength({min: 3}), check("Newlastname").isLength({ min: 3 })],
  (request, response) => {
    console.log(request.body);
    let updateObj = { firstname: request.body.newfirstname };
    if (request.body.newlastname == request.body.reNewlastname) {
      updateObj.lastname = request.body.newlastname;
    }
    User.findById(request.params.id).then(user => {
      user.firstname = updateObj.firstname;
      user.lastname = updateObj.lastname;
      user.save();
      request.logout();
      request.flash("updated", "Updated. Please Signin again!");
      response.redirect("/auth/signin");
    });
  }
);

// check("firstname").isLength({ min: 3 }),
//     check("lastname").isLength({ min: 3 }),

// router.post(
//   "/user/update/:id",
//   [check("newEmail").isEmail(), check("newLast Name").isLength({ min: 6 })],
//   (request, response) => {
//     const errors = validationResult(request);
//     if (!errors.isEmpty()) {
//       request.flash("autherror", errors.errors);
//       return response.redirect("/user/update");
//     }
//     User.findOneAndUpdate(
//       { _id: request.params.id },
//       {
//         $set: {
//           email: request.body.newEmail,
//           password: request.body.newPassword
//         }
//       }
//     )
//       .then(() => {
//         passport.authenticate("local", {
//           successRedirect: "/home",
//           successFlash: "Updated!"
//         })(request, response);
//       })
//       .catch(err => {
//         console.log(err);
//         request.flash("error", "Email already exists!");
//         return response.redirect("/home");
//       });
//   }
// );
// router.get("/auth/signup", (request, response) => {
//   response.render("auth/signup");
// });

// router.get("/auth/signin", (request, response) => {
//   response.render("auth/signin");
// });

// //--- Logout Route
// router.get("/auth/logout", (request, response) => {
//   request.logout(); //clear and break session
//   request.flash("success", "Dont leave please come back!");
//   response.redirect("/auth/signin");
// });

// router.get("/home", isLoggedIn, (request, response) => {
//   response.render("home");
//   //   Order.find().then(orders => {
//   //     response.render("home", { orders });
//   //   });
// });

// //--- Post

// router.post(
//   "/auth/signup",
//   [
//     check("firstname").isLength({ min: 3 }),
//     check("lastname").isLength({ min: 3 }),
//     check("email").isEmail(),
//     check("password").isLength({ min: 6 })
//   ],
//   (request, response) => {
//     const errors = validationResult(request);
//     if (!errors.isEmpty()) {
//       request.flash("autherror", errors.errors);
//       return response.redirect("/auth/signup");
//     }
//     let user = new User(request.body);
//     user
//       .save()
//       .then(() => {
//         // response.redirect("/home");
//         passport.authenticate("local", {
//           successRedirect: "/home",
//           successFlash: "Account created and Logged In!"
//         })(request, response);
//       })
//       .catch(err => {
//         console.log(err);
//         request.flash("error", "Email already exists!");
//         return response.redirect("/auth/signup");
//       });
//   }
// );

// //-- Login Route
// router.post(
//   "/auth/signin",
//   passport.authenticate("local", {
//     successRedirect: "/home", //after login success
//     failureRedirect: "/auth/signin", //if fail
//     failureFlash: "Invalid Username or Password",
//     successFlash: "You have logged In!"
//   })
// );

module.exports = router;
