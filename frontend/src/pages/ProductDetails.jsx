// client/src/pages/ProductDetails.jsx
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import CommentSection from "../components/CommentSection";
import RelatedProducts from "../components/RelatedProducts";
import { addToCartBackend, addToCartLocal } from "../features/cart/cartSlice";
import { toggleLike } from "../features/products/productSlice";
import API from "../services/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Scroll to top when component mounts or when product ID changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [id]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
        setLikeCount(data.likeCount || 0);
        if (user) {
          setIsLiked(data.likes?.includes(user.id) || false);
        }
      } catch (err) {
        toast.error("Product not found");
        console.error(err.message);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate, user]);

  const handleAddToCart = () => {
    if (!product || product.countInStock === 0) {
      toast.error("Product out of stock");
      return;
    }

    if (quantity > product.countInStock) {
      toast.error(`Only ${product.countInStock} items available!`);
      return;
    }

    if (user) {
      dispatch(addToCartBackend({ productId: product._id, quantity }))
        .unwrap()
        .then(() => {
          toast.success(`${product.name} added to cart!`);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to add to cart");
        });
    } else {
      // For local cart, we need to add multiple quantities
      for (let i = 0; i < quantity; i++) {
        dispatch(addToCartLocal(product));
      }
      toast.success(`${quantity} x ${product.name} added to cart!`);
    }
  };

  const handleLike = async () => {
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

  const handleBuyNow = () => {
    if (!product || product.countInStock === 0) {
      toast.error("Product out of stock");
      return;
    }

    if (!user) {
      // Add to cart and redirect to login
      for (let i = 0; i < quantity; i++) {
        dispatch(addToCartLocal(product));
      }
      toast.success("Please login to continue");
      navigate("/login");
    } else {
      navigate("/checkout", {
        state: {
          directBuy: true,
          product: product,
          quantity: quantity,
        },
      });
    }
  };

  // client/src/pages/ProductDetails.jsx - Fixed line 180
const handleDelete = async () => {
    if (!user || user.role !== "admin") return;

    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-bold">Delete Product</p>
          <p>Are you sure you want to delete "{product.name}"?</p>
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
                  await API.delete(`/products/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                  });
                  toast.success("Product deleted successfully!");
                  navigate("/");
                } catch (err) {
                  toast.error("Failed to delete product");
                  console.error(err.message); // Fixed: was console.err
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
  {product && (
    <CommentSection
      productId={product._id}
      onCommentUpdate={() => {
        // Refresh product data to update rating
        const refreshProduct = async () => {
          try {
            const { data } = await API.get(`/products/${id}`);
            setProduct(data);
            setLikeCount(data.likeCount || 0);
          } catch (err) {
            toast.error("Failed to refresh product");
            console.error(err.message); // Fixed: was console.err
          }
        };
        refreshProduct();
      }}
    />
  )}

  const incrementQuantity = () => {
    if (product && quantity < product.countInStock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Image Section */}
          <div className="md:w-1/2">
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-3xl shadow-2xl object-cover max-h-[600px]"
            />
          </div>

          {/* Info Section */}
          <div className="md:w-1/2 space-y-6">
            <div className="flex justify-between items-start">
              <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                {product.category}
              </span>

              <div className="flex items-center gap-4">
                {/* Like Button with Count */}
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isLiked
                      ? "bg-red-50 text-red-600 dark:bg-red-900/20"
                      : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  <Heart
                    size={20}
                    className={isLiked ? "fill-red-500 text-red-500" : ""}
                  />
                  <span className="font-bold">{likeCount}</span>
                </button>

                {user && user.role === "admin" && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={20} />
                    Delete
                  </button>
                )}
              </div>
            </div>

            <h1 className="text-5xl font-black text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            <p className="text-4xl text-blue-600 font-black tracking-tight">
              {product.price} <span className="text-lg text-gray-400">ETB</span>
            </p>

            {product.oldPrice && product.oldPrice > product.price && (
              <del className="text-xl text-red-400 font-bold">
                {product.oldPrice} ETB
              </del>
            )}

            <p className="text-gray-500 dark:text-gray-400 text-xl leading-relaxed font-medium">
              {product.description}
            </p>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`h-3 w-3 rounded-full ${
                    product.countInStock > 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <p
                  className={`font-bold text-lg ${
                    product.countInStock > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {product.countInStock > 0
                    ? `${product.countInStock} items in stock`
                    : "Out of stock!"}
                </p>
              </div>

              {/* Quantity Selector */}
              {product.countInStock > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    Quantity:
                  </span>
                  <div className="flex items-center border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="px-4 py-2 text-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-lg disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 font-bold dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.countInStock}
                      className="px-4 py-2 text-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-lg disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Max: {product.countInStock}
                  </span>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleBuyNow}
                  disabled={product.countInStock === 0}
                  className="flex-1 h-16 bg-green-600 text-white rounded-2xl font-black text-xl hover:bg-green-700 transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.countInStock === 0}
                  className="flex-1 h-16 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={24} />
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Creator Info */}
            {product.user && (
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Added by:{" "}
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {product.user.name}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {product && (
          <RelatedProducts
            currentProductId={product._id}
            category={product.category}
          />
        )}

        {/* Comments Section */}
        {product && (
          <CommentSection
            productId={product._id}
            onCommentUpdate={() => {
              // Refresh product data to update rating
              const refreshProduct = async () => {
                try {
                  const { data } = await API.get(`/products/${id}`);
                  setProduct(data);
                  setLikeCount(data.likeCount || 0);
                } catch (err) {
                  toast.error("Failed to refresh product")
                  console.error(err.message);
                  
                }
              };
              refreshProduct();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
