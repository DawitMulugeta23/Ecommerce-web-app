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

const router = express.Router();

// Public routes
router.get("/methods", getPaymentMethods);
router.get("/verify/:tx_ref", verifyPayment);
router.post("/webhook", chapaWebhook);

// Demo payment route (protected)
router.post("/demo/initialize", protect, initializeDemoPayment);

// Protected user routes
router.get("/orders", protect, getUserOrders);
router.get("/orders/:id", protect, getOrderById);
router.put("/orders/:id/cancel", protect, cancelOrder);

// Protected admin routes
router.get("/orders/admin/all", protect, admin, getAllOrders);
router.put("/orders/:id/status", protect, admin, updateOrderStatus);
router.delete("/orders/:id", protect, admin, deleteOrder);

// Payment initialization routes
router.post("/chapa/initialize", protect, initializeChapaPayment);

export default router;
