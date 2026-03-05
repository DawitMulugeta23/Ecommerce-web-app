// client/src/pages/AdminEditProduct.jsx
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { fetchProducts } from "../features/products/productSlice";
import API from "../services/api";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Shoes",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Other",
];

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode, setIsDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
    countInStock: "",
  });

  const [originalPrice, setOriginalPrice] = useState(0);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setFormData({
          name: data.name,
          price: data.price,
          description: data.description,
          category: data.category,
          image: data.image,
          countInStock: data.countInStock,
        });
        setOriginalPrice(data.price);
        setLoading(false);
      } catch (err) {
        toast.error("ምርቱን ማግኘት አልተቻለም");
        console.error(err.message);
        navigate("/");
      }
    };
    getProduct();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "admin") {
      return toast.error("ይህንን ለማድረግ የአድሚን ፈቃድ ያስፈልጋል!");
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      };

      const updatedData = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category,
        image: formData.image,
        countInStock: Number(formData.countInStock),
        oldPrice: Number(formData.price) < originalPrice ? originalPrice : null,
      };

      const { data } = await API.put(`/products/${id}`, updatedData, config);

      if (data) {
        toast.success("ምርቱ በትክክል ተሻሽሏል!");
        dispatch(fetchProducts());
        navigate("/");
      }
    } catch (err) {
      console.error("Update Error:", err.response?.data);
      toast.error(err.response?.data?.message || "ማስተካከል አልተቻለም");
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${isDarkMode ? "dark" : ""} bg-gray-50 dark:bg-gray-950 flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-50 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-black">
            በመጫን ላይ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "dark" : ""} bg-gray-50 dark:bg-gray-950 transition-colors duration-300 py-10`}
    >
      {/* Theme Toggle Button */}
      <div className="max-w-2xl mx-auto mb-4 flex justify-end px-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-yellow-400 hover:scale-110 transition shadow-lg border border-gray-200 dark:border-gray-700"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl my-10 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <h2 className="text-3xl font-black mb-8 text-gray-800 dark:text-white border-b dark:border-gray-700 pb-4">
          ምርት ያስተካክሉ
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Name */}
          <div>
            <label className="block font-bold mb-2 text-gray-700 dark:text-gray-300">
              የምርት ስም
            </label>
            <input
              type="text"
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 dark:text-white"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block font-bold mb-2 text-gray-700 dark:text-gray-300">
                ዋጋ (ETB)
              </label>
              <input
                type="number"
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>
            {/* Stock */}
            <div>
              <label className="block font-bold mb-2 text-gray-700 dark:text-gray-300">
                ብዛት (Stock)
              </label>
              <input
                type="number"
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                value={formData.countInStock}
                onChange={(e) =>
                  setFormData({ ...formData, countInStock: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block font-bold mb-2 text-gray-700 dark:text-gray-300">
              ካቴጎሪ
            </label>
            <select
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer text-gray-900 dark:text-white"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-gray-800">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label className="block font-bold mb-2 text-gray-700 dark:text-gray-300">
              ምስል (URL)
            </label>
            <input
              type="text"
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              required
            />

            {/* Image Preview */}
            {formData.image && (
              <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x200?text=Invalid+Image+URL";
                  }}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold mb-2 text-gray-700 dark:text-gray-300">
              ዝርዝር መግለጫ
            </label>
            <textarea
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              ተመለስ
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-600 dark:hover:bg-blue-700 transition shadow-xl"
            >
              ለውጦችን መዝግብ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditProduct;
