// backend/models/OrderAnalytics.js
import mongoose from "mongoose";

const orderAnalyticsSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    week: {
      type: Number,
    },
  },
  { timestamps: true },
);

// Indexes for analytics queries
orderAnalyticsSchema.index({ product: 1, date: -1 });
orderAnalyticsSchema.index({ month: 1, year: 1 });
orderAnalyticsSchema.index({ product: 1, month: 1, year: 1 });

const OrderAnalytics = mongoose.model("OrderAnalytics", orderAnalyticsSchema);
export default OrderAnalytics;
