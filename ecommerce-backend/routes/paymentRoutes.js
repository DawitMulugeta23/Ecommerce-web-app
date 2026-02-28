import express from "express";
import {
    chapaWebhook,
    getPaymentMethods,
    initializeCbeBirrPayment,
    initializeChapaPayment,
    initializeTelebirrPayment,
    verifyPayment,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
} from "../controllers/paymentController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Payment methods
router.get("/methods", protect, getPaymentMethods);
router.get("/orders", protect, getUserOrders);
router.get("/orders/:id", protect, getOrderById);
router.get("/orders/admin/all", protect, admin, getAllOrders);
router.put("/orders/:id/status", protect, admin, updateOrderStatus);

// Payment initializations
router.post("/chapa/initialize", protect, initializeChapaPayment);
router.post("/telebirr/initialize", protect, initializeTelebirrPayment);
router.post("/cbebirr/initialize", protect, initializeCbeBirrPayment);

// Verification and webhook
router.get("/verify/:tx_ref", verifyPayment);
router.post("/webhook", chapaWebhook);

export default router;