// backend/routes/cartRoutes.js
import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  syncCart,
  updateCartItem,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  addToCartSchema,
  cartIdSchema,
  syncCartSchema,
  updateCartSchema,
} from "../validations/cartValidation.js";

const router = express.Router();

router
  .route("/")
  .post(protect, validate(addToCartSchema), addToCart)
  .get(protect, getCart);

router.route("/sync").post(protect, validate(syncCartSchema), syncCart);

router
  .route("/:id")
  .delete(protect, validate(cartIdSchema), removeFromCart)
  .put(protect, validate(updateCartSchema), updateCartItem);

export default router;
