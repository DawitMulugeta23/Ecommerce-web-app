// client/src/components/ProductCard.jsx
import {
  CreditCard,
  Edit2,
  Eye,
  Heart,
  ShoppingCart,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addToCartBackend, addToCartLocal } from "../features/cart/cartSlice";
import { deleteProduct, toggleLike } from "../features/products/productSlice";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(
    user && product.likes ? product.likes.includes(user.id) : false,
  );
  const [likeCount, setLikeCount] = useState(product.likeCount || 0);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (product.countInStock <= 0) {
      toast.error("Product out of stock!");
      return;
    }

    if (!user) {
      dispatch(addToCartLocal(product));
      toast.success(`${product.name} added to cart!`);
      return;
    }

    try {
      await dispatch(
        addToCartBackend({
          productId: product._id,
          quantity: 1,
        }),
      ).unwrap();

      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err?.message || "Failed to add to cart");
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to like products");
      navigate("/login");
      return;
    }

    try {
      const result = await dispatch(toggleLike(product._id)).unwrap();
      setIsLiked(result.liked);
      setLikeCount(result.likeCount);
      toast.success(result.liked ? "Product liked!" : "Product unliked!");
    } catch (err) {
      toast.error("Failed to like product");
      console.error(err.message);
    }
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();

    if (product.countInStock <= 0) {
      toast.error("Product out of stock!");
      return;
    }

    if (!user) {
      dispatch(addToCartLocal(product));
      toast.success("Please login to continue");
      navigate("/login");
    } else {
      navigate("/checkout", {
        state: {
          directBuy: true,
          product: product,
          quantity: 1,
        },
      });
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();

    if (isDeleting) return;

    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-2">
          <p className="font-bold text-red-600 text-lg">⚠️ Permanent Delete</p>
          <p className="text-gray-800 dark:text-gray-200">
            Are you sure you want to permanently delete "{product.name}"?
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
            <p className="font-bold mb-1">This will:</p>
            <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
              <li>Remove product from database</li>
              <li>Delete all comments</li>
              <li>Remove from all users' carts</li>
              <li>Mark as deleted in orders</li>
            </ul>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-bold transition"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold flex items-center gap-2 transition"
              onClick={async () => {
                toast.dismiss(t.id);
                setIsDeleting(true);

                const deletingToast = toast.loading("Deleting product...");

                try {
                  const result = await dispatch(
                    deleteProduct(product._id),
                  ).unwrap();
                  console.log("Delete result:", result);

                  if (result.success) {
                    toast.success(
                      `✅ "${product.name}" deleted successfully!`,
                      {
                        id: deletingToast,
                        duration: 3000,
                      },
                    );
                  } else {
                    toast.error("Failed to delete product", {
                      id: deletingToast,
                    });
                  }
                } catch (err) {
                  console.error("Delete error:", err);
                  toast.error(err?.message || "Failed to delete product", {
                    id: deletingToast,
                  });
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              <Trash2 size={16} />
              Yes, Delete Permanently
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

  const handleImageClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  // If product is null or undefined, don't render
  if (!product) return null;

  return (
    <>
      <div
        className="group bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 flex flex-col h-full relative cursor-pointer"
        onClick={handleCardClick}
      >
        <div
          className="relative h-80 md:h-96 w-full overflow-hidden"
          onClick={handleImageClick}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Stock Badge - For customers only */}
          {!isAdmin && product.countInStock > 0 && (
            <div className="absolute top-4 left-4 z-10 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              Available: {product.countInStock}
            </div>
          )}

          {/* Admin Edit/Delete Buttons */}
          {isAdmin && (
            <div className="absolute top-4 left-4 flex gap-2 z-20">
              <Link
                to={`/admin/edit-product/${product._id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110"
                title="Edit product"
              >
                <Edit2 size={18} />
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete product permanently"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}

          <button
            onClick={handleLike}
            className="absolute top-4 right-4 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-md z-10 flex items-center gap-1 hover:scale-110 transition-transform"
          >
            <Heart
              size={22}
              className={
                isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 dark:text-gray-500"
              }
            />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 min-w-[20px]">
              {likeCount > 0 ? likeCount : ""}
            </span>
          </button>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          {/* Creator info - shows for admin only */}
          {product.user && isAdmin && (
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
              <User size={14} />
              <span className="truncate">Added by: {product.user.name}</span>
              {product.user.profilePicture && (
                <img
                  src={product.user.profilePicture}
                  alt={product.user.name}
                  className="w-5 h-5 rounded-full"
                />
              )}
            </div>
          )}

          {/* Product Name */}
          <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {product.name}
          </h3>

          {/* Price - ONLY ONCE! */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-black text-gray-900 dark:text-white">
              {product.price}{" "}
              <span className="text-sm font-normal text-gray-500 uppercase">
                ETB
              </span>
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <del className="text-lg text-red-400 font-bold decoration-2">
                {product.oldPrice} ETB
              </del>
            )}
          </div>

          {/* Admin Inventory Section - Detailed stock info */}
          {isAdmin && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400 font-bold">
                  Inventory Status
                </span>
                <span
                  className={`font-bold ${
                    product.countInStock > 10
                      ? "text-green-600 dark:text-green-400"
                      : product.countInStock > 0
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {product.countInStock} units
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    product.countInStock > 10
                      ? "bg-green-500"
                      : product.countInStock > 0
                        ? "bg-orange-500"
                        : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min((product.countInStock / 50) * 100, 100)}%`,
                  }}
                ></div>
              </div>

              {/* Stock Status Text */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {product.countInStock === 0
                  ? "⚠️ Out of stock - hidden from customers"
                  : product.countInStock < 10
                    ? `⚠️ Low stock - only ${product.countInStock} left`
                    : "✅ In stock"}
              </p>
            </div>
          )}

          {/* NO LOW STOCK WARNING FOR CUSTOMERS - REMOVED */}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={handleBuyNow}
              disabled={product.countInStock === 0}
              className="flex-1 h-14 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard size={20} /> <span>Buy</span>
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={20} /> <span>Add</span>
            </button>
            <Link
              to={`/product/${product._id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-0.5 px-4 h-14 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-700 hover:text-white transition"
            >
              <Eye size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            className="absolute top-10 right-10 text-white hover:text-red-500 transition-colors"
            onClick={() => setIsModalOpen(false)}
          >
            <X size={40} />
          </button>
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ProductCard;
