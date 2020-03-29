const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const artistSchema = mongoose.Schema(
  {
    firstname: {
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
    artistType: {
      type: String,
      enum: ["admin", "user", "artist"],
      default: "artist"
    }
  },
  { timestamps: true }
);

artistSchema.pre("save", function(next) {
  var artist = this;
  // Only hash the password if it has been modified (or is new)
  if (!artist.isModified("password")) return next();

  //hash the password
  var hash = bcrypt.hashSync(artist.password, 10);

  // Override the cleartext password with the hashed one
  artist.password = hash;
  next();
});

artistSchema.methods.validPassword = function(password) {
  // Compare is a bcrypt method that will return a boolean,
  return bcrypt.compareSync(password, this.password);
};

const Artist = mongoose.model("Artist", artistSchema);
module.exports = Artist;
