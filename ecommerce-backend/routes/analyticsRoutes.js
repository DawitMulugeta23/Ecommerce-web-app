// backend/routes/analyticsRoutes.js
import express from "express";
import {
  getAnalyticsDashboard,
  getProductDemandAnalysis,
} from "../controllers/analyticsController.js";
import { admin, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { analyticsQuerySchema } from "../validations/analyticsValidation.js";

const router = express.Router();

// All analytics routes are admin only
router.get(
  "/dashboard",
  protect,
  admin,
  validate(analyticsQuerySchema),
  getAnalyticsDashboard,
);
router.get(
  "/demand",
  protect,
  admin,
  validate(analyticsQuerySchema),
  getProductDemandAnalysis,
);

export default router;
