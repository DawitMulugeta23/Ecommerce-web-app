import express from 'express';
import upload from '../config/cloudinary.js'; 
import { createProduct, getProducts } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', protect, admin, upload.single('image'), createProduct);

export default router;