// backend/routes/analyticsRoutes.js
import express from 'express';
import {
  getAnalyticsDashboard,
  getProductDemandAnalysis
} from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All analytics routes are admin only
router.get('/dashboard', protect, admin, getAnalyticsDashboard);
router.get('/demand', protect, admin, getProductDemandAnalysis);

export default router;