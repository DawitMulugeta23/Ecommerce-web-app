import express from 'express';
import { initializePayment, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initialize', protect, initializePayment);
router.get('/verify/:tx_ref', verifyPayment);

export default router;