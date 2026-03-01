// backend/controllers/commentController.js
import mongoose from "mongoose"; // Add this import
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
        message:
          "You have already commented on this product. You can edit your existing comment.",
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

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
export const updateComment = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const commentId = req.params.id;

    const existingComment = await Comment.findById(commentId);

    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found!" });
    }

    // Check if user owns the comment or is admin
    if (
      existingComment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this comment!" });
    }

    existingComment.rating = rating || existingComment.rating;
    existingComment.comment = comment || existingComment.comment;
    await existingComment.save();

    await existingComment.populate("user", "name email profilePicture");

    res.json({
      success: true,
      comment: existingComment,
      message: "Comment updated successfully!",
    });
  } catch (error) {
    console.error("Error in updateComment:", error);
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

    // Check if user owns the comment or is admin
    if (
      comment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment!" });
    }

    await comment.deleteOne();

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
