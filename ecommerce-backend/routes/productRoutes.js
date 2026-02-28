import express from 'express';
import upload from '../config/cloudinary.js'; 
import { 
  createProduct, 
  getProducts,
  getProductById, 
  updateProduct,
  deleteProduct,
  updateProductStock 
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, upload.single('image'), createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.put('/:id/stock', protect, admin, updateProductStock);

export default router;