module.exports = function(request, response, next) {
  if (!request.user) {
    request.flash("error", "You must be logged in to access that page");
    response.redirect("/auth/signin");
  } else if (request.user.userType != "user") {
    request.flash("error", "You must be an User to access this page");
    response.redirect("/home");
  } else {
    next();
  }
};
