// backend/routes/commentRoutes.js
import express from "express";
import {
  addComment,
  deleteComment,
  getProductComments,
  replyToComment,
  toggleCommentLike,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  addCommentSchema,
  commentIdSchema,
  getProductCommentsSchema,
  replyToCommentSchema,
} from "../validations/commentValidation.js";

const router = express.Router();

// Public routes
router.get(
  "/product/:productId",
  validate(getProductCommentsSchema),
  getProductComments,
);

// Protected routes
router.post("/", protect, validate(addCommentSchema), addComment);
router.delete("/:id", protect, validate(commentIdSchema), deleteComment);
router.post("/:id/like", protect, validate(commentIdSchema), toggleCommentLike);
router.post(
  "/:id/reply",
  protect,
  validate(replyToCommentSchema),
  replyToComment,
);

export default router;
