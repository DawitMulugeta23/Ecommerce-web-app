// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
      },
    ],
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      phone: { type: String },
    },
    totalPrice: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["chapa"],
      required: true,
    },
    paymentResult: {
      tx_ref: String,
      status: { type: String, default: "pending" },
      checkout_url: String,
      method: String,
      customer: {
        email: String,
        phone: String,
        address: String,
        city: String,
      },
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
