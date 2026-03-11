// backend/routes/paymentRoutes.js
import express from "express";
import {
  cancelOrder,
  chapaWebhook,
  deleteOrder,
  getAllOrders,
  getOrderById,
  getPaymentMethods,
  getUserOrders,
  initializeChapaPayment,
  initializeDemoPayment,
  updateOrderStatus,
  verifyPayment,
} from "../controllers/paymentController.js";
import { admin, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  initializeChapaPaymentSchema,
  initializeDemoPaymentSchema,
  orderIdSchema,
  updateOrderStatusSchema,
} from "../validations/paymentValidation.js";

const router = express.Router();

// Public routes
router.get("/methods", getPaymentMethods);
router.get("/verify/:tx_ref", verifyPayment);
router.post("/webhook", chapaWebhook);

// Demo payment route (protected)
router.post(
  "/demo/initialize",
  protect,
  validate(initializeDemoPaymentSchema),
  initializeDemoPayment,
);

// Protected user routes
router.get("/orders", protect, getUserOrders);
router.get("/orders/:id", protect, validate(orderIdSchema), getOrderById);
router.put("/orders/:id/cancel", protect, validate(orderIdSchema), cancelOrder);

// Protected admin routes
router.get("/orders/admin/all", protect, admin, getAllOrders);
router.put(
  "/orders/:id/status",
  protect,
  admin,
  validate(updateOrderStatusSchema),
  updateOrderStatus,
);
router.delete(
  "/orders/:id",
  protect,
  admin,
  validate(orderIdSchema),
  deleteOrder,
);

// Payment initialization routes
router.post(
  "/chapa/initialize",
  protect,
  validate(initializeChapaPaymentSchema),
  initializeChapaPayment,
);

export default router;
