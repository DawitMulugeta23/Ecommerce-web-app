import express from "express";
import {
  chapaWebhook,
  getAllOrders,
  getOrderById,
  getPaymentMethods,
  getUserOrders,
  initializeCbeBirrPayment,
  initializeChapaPayment,
  initializeTelebirrPayment,
  updateOrderStatus,
  verifyPayment,
} from "../controllers/paymentController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/methods", getPaymentMethods);
router.get("/verify/:tx_ref", verifyPayment);
router.post("/webhook", chapaWebhook);

// Protected user routes
router.get("/orders", protect, getUserOrders);
router.get("/orders/:id", protect, getOrderById);

// Protected admin routes
router.get("/orders/admin/all", protect, admin, getAllOrders);
router.put("/orders/:id/status", protect, admin, updateOrderStatus);

// Payment initialization routes (protected)
router.post("/chapa/initialize", protect, initializeChapaPayment);
router.post("/telebirr/initialize", protect, initializeTelebirrPayment);
router.post("/cbebirr/initialize", protect, initializeCbeBirrPayment);

export default router;
