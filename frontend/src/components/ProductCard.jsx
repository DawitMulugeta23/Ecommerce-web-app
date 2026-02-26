import {
  CreditCard,
  Edit2,
  Eye,
  Heart,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../features/cart/cartSlice";
import { fetchProducts } from "../features/products/productSlice"; // ለገጹ መታደስ
import API from "../services/api";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // 🛒 ወደ ቅርጫት ጨምር
  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart(product));
    toast.success(`${product.name} ታክሏል!`);
  };

  // 💳 አሁኑኑ ግዛ
  const handleBuyNow = (e) => {
    e.stopPropagation();
    dispatch(addToCart(product));
    navigate("/checkout");
  };

  // 🗑️ ምርት ሰርዝ (Delete Functionality)
  const handleDelete = async (e) => {
    e.stopPropagation(); // ምስሉ እንዳይከፈት

    if (!user || user.role !== "admin") {
      return toast.error("ይህንን ለማድረግ ፈቃድ የለዎትም!");
    }

    if (window.confirm(`እርግጠኛ ነዎት "${product.name}" መሰረዝ ይፈልጋሉ?`)) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };

        await API.delete(`/products/${product._id}`, config);

        toast.success("ምርቱ በትክክል ተሰርዟል!");

        // 🔥 ዋናው ነጥብ፡ ገጹን ወዲያውኑ ለማደስ
        dispatch(fetchProducts());
      } catch (err) {
        console.error("Delete Error:", err);
        toast.error(err.response?.data?.message || "መሰረዝ አልተቻለም");
      }
    }
  };

  return (
    <>
      <div className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full relative">
        {/* ምስል ክፍል */}
        <div
          className="relative h-80 md:h-96 w-full overflow-hidden cursor-zoom-in"
          onClick={() => setIsModalOpen(true)}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* የአድሚን ቁልፎች */}
          {user && user.role === "admin" && (
            <div className="absolute top-4 left-4 flex gap-2 z-20">
              <Link
                to={`/admin/edit-product/${product._id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110"
              >
                <Edit2 size={18} />
              </Link>
              <button
                onClick={handleDelete}
                className="p-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-transform hover:scale-110"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-md z-10"
          >
            <Heart
              size={22}
              className={
                isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
              }
            />
          </button>
        </div>

        {/* መረጃዎች */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-black text-gray-800 mb-2 truncate">
            {product.name}
          </h3>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-black text-gray-900">
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

          <div className="flex gap-2 mt-auto">
            <button
              onClick={handleBuyNow}
              className="flex-1 h-14 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100"
            >
              <CreditCard size={20} /> <span>Buy</span>
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100"
            >
              <ShoppingCart size={20} /> <span>Add</span>
            </button>
            <Link
              to={`/product/${product._id}`}
              className="flex-0.5 px-4 h-14 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center hover:bg-gray-800 hover:text-white transition"
            >
              <Eye size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* ምስል ማሳያ Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <button className="absolute top-10 right-10 text-white">
            <X size={40} />
          </button>
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-[90vh] rounded-xl object-contain animate-in zoom-in duration-300"
          />
        </div>
      )}
    </>
  );
};

export default ProductCard;
