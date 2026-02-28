import express from 'express';
import upload from '../config/cloudinary.js'; 
import { 
  createProduct, 
  getProducts,
  getProductById, 
  updateProduct,
  deleteProduct,
  toggleLike,
  getProductsByUser
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (require login)
router.get('/user/:userId', protect, admin, getProductsByUser);
router.post('/:id/like', protect, toggleLike);

// Admin only routes
router.post('/', protect, admin, upload.single('image'), createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;