const mongoose = require("mongoose");

const artSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    count: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true },


{
  name: String,
  image: String,
  art: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "art"
  }]
}, {
  timestamp: true
})



const Art = mongoose.model("Art", artSchema);
module.exports = Art;
