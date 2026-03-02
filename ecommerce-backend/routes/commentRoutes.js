// backend/routes/commentRoutes.js
import express from "express";
import {
  addComment,
  deleteComment,
  getProductComments,
  replyToComment,
  toggleCommentLike,
  updateComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductComments);

// Protected routes
router.post("/", protect, addComment);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);
router.post("/:id/like", protect, toggleCommentLike);
router.post("/:id/reply", protect, replyToComment);

export default router;
