const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    arts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Art"
      }
    ],
    totalQty: {
      type: Number,
      required: true,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
