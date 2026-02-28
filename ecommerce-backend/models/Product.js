import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    image: { type: String, required: true },
    category: { type: String, required: true },
    countInStock: { type: Number, required: true, default: 5 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who created the product
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs who liked
    likeCount: { type: Number, default: 0 }, // Denormalized count for performance
  },
  { timestamps: true },
);

// Virtual for populated user details
productSchema.virtual("creator", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export default mongoose.model("Product", productSchema);
