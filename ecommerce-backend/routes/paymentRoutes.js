import express from 'express';
import { initializePayment, verifyPayment, chapaWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/initialize', protect, initializePayment);
router.get('/verify/:tx_ref', verifyPayment);
router.post('/webhook', chapaWebhook);

export default router;