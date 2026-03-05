// backend/controllers/commentController.js
import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Product from "../models/Product.js";

// @desc    Get comments for a product
// @route   GET /api/comments/product/:productId
// @access  Public
export const getProductComments = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ product: productId })
      .populate("user", "name email profilePicture")
      .populate("replies.user", "name email profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ product: productId });

    // Get rating distribution
    const ratingStats = await Comment.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratingStats.forEach((stat) => {
      ratingDistribution[stat._id] = stat.count;
    });

    // Update product rating when fetching comments
    await updateProductRating(productId);

    res.json({
      comments,
      ratingDistribution,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalComments: total,
    });
  } catch (error) {
    console.error("Error in getProductComments:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    const comments = await Comment.find({ product: productId });
    if (comments.length === 0) return;

    const totalRating = comments.reduce(
      (sum, comment) => sum + comment.rating,
      0,
    );
    const avgRating = totalRating / comments.length;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: comments.length,
    });
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};

// @desc    Add comment to a product
// @route   POST /api/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    // Check if user already commented on this product
    const existingComment = await Comment.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingComment) {
      return res.status(400).json({
        message: "You have already commented on this product.",
      });
    }

    // Create new comment
    const newComment = await Comment.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
    });

    // Populate user details
    await newComment.populate("user", "name email profilePicture");

    // Update product rating
    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      comment: newComment,
      message: "Comment added successfully!",
    });
  } catch (error) {
    console.error("Error in addComment:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found!" });
    }

    // Check if user is admin or comment owner
    if (
      req.user.role !== "admin" &&
      comment.user.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment!" });
    }

    const productId = comment.product;
    await comment.deleteOne();

    // Update product rating after deletion
    await updateProductRating(productId);

    res.json({
      success: true,
      message: "Comment deleted successfully!",
    });
  } catch (error) {
    console.error("Error in deleteComment:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike a comment
// @route   POST /api/comments/:id/like
// @access  Private
export const toggleCommentLike = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found!" });
    }

    const hasLiked = comment.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      // Like
      comment.likes.push(userId);
      comment.likeCount += 1;
    }

    await comment.save();

    res.json({
      liked: !hasLiked,
      likeCount: comment.likeCount,
    });
  } catch (error) {
    console.error("Error in toggleCommentLike:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to a comment
// @route   POST /api/comments/:id/reply
// @access  Private
export const replyToComment = async (req, res) => {
  try {
    const { text } = req.body;
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found!" });
    }

    comment.replies.push({
      user: req.user._id,
      text,
    });

    await comment.save();
    await comment.populate("replies.user", "name email profilePicture");

    res.json({
      success: true,
      replies: comment.replies,
      message: "Reply added successfully!",
    });
  } catch (error) {
    console.error("Error in replyToComment:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a comment - DISABLED
// @route   PUT /api/comments/:id
// @access  Private
export const updateComment = async (req, res) => {
  return res.status(403).json({
    message:
      "Comment editing is not allowed. Please delete and create a new comment.",
  });
};
