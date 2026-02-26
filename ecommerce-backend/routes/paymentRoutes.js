import express from 'express';
import { 
  initializeChapaPayment,
  initializeTelebirrPayment,
  initializeCbeBirrPayment,
  verifyPayment, 
  chapaWebhook,
  getPaymentMethods 
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/methods', protect, getPaymentMethods);
router.post('/chapa/initialize', protect, initializeChapaPayment);
router.post('/telebirr/initialize', protect, initializeTelebirrPayment);
router.post('/cbebirr/initialize', protect, initializeCbeBirrPayment);
router.get('/verify/:tx_ref', verifyPayment);
router.post('/webhook', chapaWebhook);

export default router;