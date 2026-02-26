import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProducts } from "../features/products/productSlice";
import API from "../services/api";

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

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

  // 1. የምርቱን ነባር ዳታ ከመረጃ ቋት መጫን
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
        navigate("/");
      }
    };
    getProduct();
  }, [id, navigate]);

  // 2. የተስተካከለው ለውጦችን መላኪያ ተግባር (Functional Submit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "admin") {
      return toast.error("ይህንን ለማድረግ የአድሚን ፈቃድ ያስፈልጋል!");
    }

    try {
      // 🛠️ የጥሪ ቅንጅት (Headers)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      };

      // 📦 አዲሱን ዳታ ማዘጋጀት (Payload)
      const updatedData = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category,
        image: formData.image,
        countInStock: Number(formData.countInStock),
        // ዋጋው ከቀነሰ ብቻ የቀድሞውን ዋጋ (oldPrice) መመዝገብ
        oldPrice: Number(formData.price) < originalPrice ? originalPrice : null,
      };

      // 🚀 የ API ጥሪ
      const { data } = await API.put(`/products/${id}`, updatedData, config);

      if (data) {
        toast.success("ምርቱ በትክክል ተሻሽሏል!");
        dispatch(fetchProducts()); // ገጹ በራሱ እንዲታደስ Redux መጥራት
        navigate("/"); // ወደ ዋናው ገጽ መመለስ
      }
    } catch (err) {
      console.error("Update Error:", err.response?.data);
      toast.error(err.response?.data?.message || "ማስተካከል አልተቻለም");
    }
  };

  if (loading)
    return <div className="text-center py-20 font-black">በመጫን ላይ...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-[2rem] shadow-2xl my-10 border border-gray-100">
      <h2 className="text-3xl font-black mb-8 text-gray-800 border-b pb-4">
        ምርት ያስተካክሉ
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* የምርት ስም */}
        <div>
          <label className="block font-bold mb-2 text-gray-600">የምርት ስም</label>
          <input
            type="text"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* ዋጋ */}
          <div>
            <label className="block font-bold mb-2 text-gray-600">
              ዋጋ (ETB)
            </label>
            <input
              type="number"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>
          {/* ብዛት */}
          <div>
            <label className="block font-bold mb-2 text-gray-600">
              ብዛት (Stock)
            </label>
            <input
              type="number"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.countInStock}
              onChange={(e) =>
                setFormData({ ...formData, countInStock: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* ካቴጎሪ */}
        <div>
          <label className="block font-bold mb-2 text-gray-600">ካቴጎሪ</label>
          <select
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Shoes">Shoes</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Beauty">Beauty</option>
            <option value="Sports">Sports</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* ምስል URL */}
        <div>
          <label className="block font-bold mb-2 text-gray-600">
            ምስል (URL)
          </label>
          <input
            type="text"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            required
          />
        </div>

        {/* መግለጫ */}
        <div>
          <label className="block font-bold mb-2 text-gray-600">
            ዝርዝር መግለጫ
          </label>
          <textarea
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          ></textarea>
        </div>

        {/* ቁልፎች */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition"
          >
            ተመለስ
          </button>
          <button
            type="submit"
            className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-blue-600 transition shadow-xl"
          >
            ለውጦችን መዝግብ
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditProduct;
