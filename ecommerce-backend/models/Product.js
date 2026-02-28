import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number }, // Added for sale price display
    image: { type: String, required: true },
    category: { type: String, required: true },
    countInStock: { type: Number, required: true, default: 5 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
