import express from 'express';
import upload from '../config/cloudinary.js'; 
import { createProduct, getProducts,getProductById } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, upload.single('image'), createProduct);

export default router;