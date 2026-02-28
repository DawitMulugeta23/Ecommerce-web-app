import { ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { addToCartBackend, addToCartLocal } from "../features/cart/cartSlice"; // Fixed import
import API from "../services/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product", err);
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.countInStock === 0) {
      toast.error("Product out of stock");
      return;
    }

    if (user) {
      dispatch(addToCartBackend({ productId: product._id, quantity: 1 }))
        .unwrap()
        .then(() => {
          toast.success(`${product.name} added to cart!`);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to add to cart");
        });
    } else {
      dispatch(addToCartLocal(product));
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleDelete = async () => {
    if (!user || user.role !== "admin") return;

    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await API.delete(`/products/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        toast.success("Product deleted successfully!");
        navigate("/");
      } catch (err) {
        toast.error("Failed to delete product");
        console.error(err.message)
      }
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

              {user && user.role === "admin" && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all"
                >
                  <Trash2 size={20} />
                  Delete Product
                </button>
              )}
            </div>

            <h1 className="text-5xl font-black text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            <p className="text-4xl text-blue-600 font-black tracking-tight">
              {product.price} <span className="text-lg text-gray-400">ETB</span>
            </p>

            <p className="text-gray-500 dark:text-gray-400 text-xl leading-relaxed font-medium">
              {product.description}
            </p>

            <div className="pt-10 border-t border-gray-100 dark:border-gray-800">
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

              <button
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className="w-full h-16 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={24} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
