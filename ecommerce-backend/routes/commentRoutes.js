// backend/routes/commentRoutes.js
import express from 'express';
import {
  addComment,
  getProductComments,
  updateComment,
  deleteComment,
  toggleCommentLike,
  replyToComment
} from '../controllers/commentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductComments);

// Protected routes
router.post('/', protect, addComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleCommentLike);
router.post('/:id/reply', protect, replyToComment);

export default router;