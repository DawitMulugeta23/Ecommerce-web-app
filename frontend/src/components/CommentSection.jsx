// client/src/components/CommentSection.jsx
import { Heart, Reply, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

// Simple date formatter function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 30) {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } else if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
};

const CommentSection = ({ productId, onCommentUpdate }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  // const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [stats, setStats] = useState({
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    totalComments: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchComments();
  }, [productId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/comments/product/${productId}`);
      setComments(data.comments || []);
      setStats({
        ratingDistribution: data.ratingDistribution || {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
        totalComments: data.totalComments || 0,
        averageRating: calculateAverage(
          data.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        ),
      });
    } catch (err) {
      toast.error("Failed to load comments");
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (distribution) => {
    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;

    const sum = Object.entries(distribution).reduce(
      (acc, [rating, count]) => acc + parseInt(rating) * count,
      0,
    );
    return (sum / total).toFixed(1);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      navigate("/login");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    try {
      const { data } = await API.post("/comments", {
        productId,
        rating,
        comment: newComment,
      });

      toast.success(data.message);
      setNewComment("");
      setRating(5);
      fetchComments();
      if (onCommentUpdate) onCommentUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.error("Please login to like comments");
      navigate("/login");
      return;
    }

    try {
      await API.post(`/comments/${commentId}/like`);
      fetchComments();
    } catch (err) {
      toast.error("Failed to like comment");
      console.error(err.message);
    }
  };

  const handleReply = async (commentId) => {
    if (!user) {
      toast.error("Please login to reply");
      navigate("/login");
      return;
    }

    if (!replyText.trim()) {
      toast.error("Please write a reply");
      return;
    }

    try {
      await API.post(`/comments/${commentId}/reply`, { text: replyText });
      toast.success("Reply added!");
      setReplyingToCommentId(null);
      setReplyText("");
      fetchComments();
    } catch (err) {
      toast.error("Failed to add reply");
      console.error(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    // Check if user is admin or comment owner
    const canDelete =
      user &&
      (user.role === "admin" ||
        user._id === comments.find((c) => c._id === commentId)?.user?._id);

    if (!canDelete) {
      toast.error("You don't have permission to delete this comment");
      return;
    }

    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-bold">Delete Comment</p>
          <p>Are you sure you want to delete this comment?</p>
          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
              onClick={() => toast.dismiss(t.id)}
            >
              No
            </button>
            <button
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await API.delete(`/comments/${commentId}`);
                  toast.success("Comment deleted!");
                  fetchComments();
                  if (onCommentUpdate) onCommentUpdate();
                } catch (err) {
                  toast.error(
                    err.response?.data?.message || "Failed to delete comment",
                  );
                }
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      },
    );
  };

  const renderStars = (value, onChange, disabled = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !disabled && onChange(star)}
            disabled={disabled}
            className="focus:outline-none disabled:cursor-not-allowed"
          >
            <Star
              size={20}
              className={`${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderRatingStats = () => {
    const total = Object.values(stats.ratingDistribution).reduce(
      (a, b) => a + b,
      0,
    );

    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl mb-6">
        <div className="flex items-center gap-8 flex-wrap">
          <div className="text-center">
            <div className="text-5xl font-black text-gray-900 dark:text-white">
              {stats.averageRating}
            </div>
            <div className="flex mt-2 justify-center">
              {renderStars(Math.round(stats.averageRating), () => {}, true)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stats.totalComments}{" "}
              {stats.totalComments === 1 ? "review" : "reviews"}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingDistribution[star] || 0;
              const percentage = total > 0 ? (count / total) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm font-bold w-8 dark:text-gray-300">
                    {star}★
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-12">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
        Customer Reviews
      </h2>

      {stats.totalComments > 0 && renderRatingStats()}

      {/* Add Comment Form */}
      {user ? (
        <form
          onSubmit={handleSubmitComment}
          className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl"
        >
          <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">
            Write a Review
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">
              Your Rating
            </label>
            {renderStars(rating, setRating)}
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows="4"
            className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white mb-4"
            required
          ></textarea>

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Submit Review
          </button>
        </form>
      ) : (
        <div className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 font-bold hover:underline bg-transparent border-none cursor-pointer"
            >
              login
            </button>{" "}
            to write a review
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          comments.map((comment) => {
            // Check if current user is admin or comment owner
            const canDelete =
              user && (user.role === "admin" || user._id === comment.user?._id);

            return (
              <div
                key={comment._id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6"
              >
                {/* Comment Header - Always visible to all users */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* User Avatar - Always visible */}
                    <img
                      src={
                        comment.user?.profilePicture ||
                        `https://ui-avatars.com/api/?name=${comment.user?.name || "User"}&background=3b82f6&color=fff`
                      }
                      alt={comment.user?.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${comment.user?.name || "User"}&background=3b82f6&color=fff`;
                      }}
                    />
                    <div>
                      {/* Username - Always visible to all users */}
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {comment.user?.name || "Anonymous User"}
                      </h4>
                      <div className="flex items-center gap-2">
                        {/* Star Rating - Always visible */}
                        <div className="flex">
                          {renderStars(comment.rating || 0, () => {}, true)}
                        </div>
                        {/* Date - Always visible */}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete button - Only visible to comment owner or admin */}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title="Delete comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Comment Content - Always visible */}
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {comment.comment}
                </p>

                {/* Like and Reply buttons - Always visible but require login to interact */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikeComment(comment._id)}
                    className={`flex items-center gap-1 text-sm ${
                      user && comment.likes?.includes(user._id)
                        ? "text-red-600"
                        : "text-gray-500 dark:text-gray-400 hover:text-red-600"
                    } transition`}
                  >
                    <Heart
                      size={16}
                      className={
                        user && comment.likes?.includes(user._id)
                          ? "fill-red-600"
                          : ""
                      }
                    />
                    <span>{comment.likeCount || 0}</span>
                  </button>

                  <button
                    onClick={() =>
                      setReplyingToCommentId(
                        replyingToCommentId === comment._id
                          ? null
                          : comment._id,
                      )
                    }
                    className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition"
                  >
                    <Reply size={16} />
                    Reply
                  </button>
                </div>

                {/* Reply Form */}
                {replyingToCommentId === comment._id && (
                  <div className="mt-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      rows="2"
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white mb-2"
                    ></textarea>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReply(comment._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                      >
                        Post Reply
                      </button>
                      <button
                        onClick={() => {
                          setReplyingToCommentId(null);
                          setReplyText("");
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Display Replies - Always visible */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 pl-6 space-y-4">
                    {comment.replies.map((reply, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-gray-200 dark:border-gray-700 pl-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={
                              reply.user?.profilePicture ||
                              `https://ui-avatars.com/api/?name=${reply.user?.name || "User"}&background=3b82f6&color=fff`
                            }
                            alt={reply.user?.name}
                            className="w-6 h-6 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${reply.user?.name || "User"}&background=3b82f6&color=fff`;
                            }}
                          />
                          {/* Reply Username - Always visible */}
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {reply.user?.name || "Anonymous User"}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {reply.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentSection;
