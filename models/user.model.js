const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const salt = 10;

const userSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true
    },
    lastname: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    userType: {
      type: String,
      enum: ["admin", "user", "artist"],
      default: "user"
    }
  },
  { timestamps: true }
);

userSchema.pre("save", function(next) {
  let user = this;
  if (!user.isModified("password")) {
    return next();
  }

  let hash = bcrypt.hashSync(user.password, salt);
  user.password = hash;
  next();
});

userSchema.methods.verifyPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
