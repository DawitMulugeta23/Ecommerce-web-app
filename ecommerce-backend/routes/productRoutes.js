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
import { validate } from "../middleware/validate.js";
import {
  createProductSchema,
  productIdSchema,
  updateProductSchema,
} from "../validations/productValidation.js";

const router = express.Router();

// Public routes (filtered for customers)
router.get("/", getProducts);
router.get("/:id", validate(productIdSchema), getProductById);

// Protected routes (require login)
router.get("/user/:userId", protect, admin, getProductsByUser);
router.post("/:id/like", protect, validate(productIdSchema), toggleLike);

// Admin only routes
router.get("/admin/all", protect, admin, getAllProductsAdmin);
router.get("/admin/zero-stock", protect, admin, getZeroStockProducts);
router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  validate(createProductSchema),
  createProduct,
);
router.put(
  "/:id",
  protect,
  admin,
  validate(updateProductSchema),
  updateProduct,
);
router.delete("/:id", protect, admin, validate(productIdSchema), deleteProduct);
router.delete(
  "/:id/permanent",
  protect,
  admin,
  validate(productIdSchema),
  permanentDeleteProduct,
);

router.get("/test-admin", protect, admin, (req, res) => {
  res.json({ 
    success: true, 
    message: "Admin access verified!", 
    user: req.user 
  });
});

export default router;
