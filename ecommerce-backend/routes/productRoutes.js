// backend/routes/productRoutes.js
import express from "express";
import upload from "../config/cloudinary.js";
import {
  createProduct,
  deleteProduct,
  getAllProductsAdmin,
  getProductById,
  getProducts,
  getProductsByUser,
  getZeroStockProducts,
  permanentDeleteProduct,
  toggleLike,
  updateProduct,
} from "../controllers/productController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (filtered for customers)
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes (require login)
router.get("/user/:userId", protect, admin, getProductsByUser);
router.post("/:id/like", protect, toggleLike);

// Admin only routes
router.get("/admin/all", protect, admin, getAllProductsAdmin);
router.get("/admin/zero-stock", protect, admin, getZeroStockProducts);
router.post("/", protect, admin, upload.single("image"), createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct); // Soft delete (sets stock to 0)
router.delete("/:id/permanent", protect, admin, permanentDeleteProduct); // Permanent delete

export default router;