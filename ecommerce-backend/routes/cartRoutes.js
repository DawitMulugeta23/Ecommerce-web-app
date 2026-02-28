import express from 'express';
import { 
  addToCart, 
  getCart, 
  removeFromCart, 
  updateCartItem,
  syncCart 
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, addToCart)
    .get(protect, getCart);

router.route('/sync')
    .post(protect, syncCart);

router.route('/:id')
    .delete(protect, removeFromCart)
    .put(protect, updateCartItem);

export default router;