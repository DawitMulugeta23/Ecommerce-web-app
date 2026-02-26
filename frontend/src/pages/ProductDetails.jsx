import { ShoppingCart, Trash2 } from "lucide-react"; // icon ለቆንጆ ዲዛይን
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux"; // 👈 useSelector በጣም አስፈላጊ ነው
import { useNavigate, useParams } from "react-router-dom"; // navigate ጨምረናል
import { addToCart } from "../features/cart/cartSlice";
import API from "../services/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. የአድሚን መረጃን ከ Redux ማምጣት (ይህ ከሌለ ቁልፉ አይታይም)
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error("ምርቱን ማምጣት አልተቻለም", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 2. ምርቱን ለመሰረዝ የሚሰራ ተግባር
  const handleDelete = async () => {
    if (window.confirm("እርግጠኛ ነዎት ይህን ምርት መሰረዝ ይፈልጋሉ?")) {
      try {
        await API.delete(`/products/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        toast.success("ምርቱ ተሰርዟል!");
        navigate("/"); // ምርቱ ሲሰረዝ ወደ Home ይመልሰናል
      } catch (err) {
        toast.error("መሰረዝ አልተቻለም");
      }
    }
  };

  if (loading)
    return <div className="text-center mt-20 font-bold">በመጫን ላይ...</div>;
  if (!product)
    return <div className="text-center mt-20 font-bold">ምርቱ አልተገኘም!</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        {/* የምስል ክፍል */}
        <div className="md:w-1/2">
          <img
            src={product.image}
            alt={product.name}
            className="w-full rounded-3xl shadow-2xl object-cover max-h-[600px]"
          />
        </div>

        {/* የመረጃ ክፍል */}
        <div className="md:w-1/2 space-y-6">
          <div className="flex justify-between items-start">
            <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              {product.category}
            </span>

            {/* 🔴 3. Delete Button (አድሚን ብቻ የሚያየው) */}
            {user && user.role === "admin" && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
              >
                <Trash2 size={20} />
                ምርት ሰርዝ (Admin)
              </button>
            )}
          </div>

          <h1 className="text-5xl font-black text-gray-900 leading-tight">
            {product.name}
          </h1>
          <p className="text-4xl text-blue-600 font-black tracking-tight">
            {product.price} <span className="text-lg text-gray-400">ETB</span>
          </p>
          <p className="text-gray-500 text-xl leading-relaxed font-medium">
            {product.description}
          </p>

          <div className="pt-10 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`h-3 w-3 rounded-full ${product.countInStock > 0 ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <p
                className={`font-bold text-lg ${product.countInStock > 0 ? "text-green-600" : "text-red-500"}`}
              >
                {product.countInStock > 0
                  ? `በክምችት ላይ: ${product.countInStock} እቃ አለ`
                  : "ይህ ምርት አልቋል!"}
              </p>
            </div>

            <button
              onClick={() => {
                dispatch(addToCart(product));
                toast.success("ቅርጫት ውስጥ ተጨምሯል!");
              }}
              disabled={product.countInStock === 0}
              className="w-full h-16 bg-gray-900 text-white rounded-2xl font-black text-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-gray-200"
            >
              <ShoppingCart size={24} />
              ወደ ቅርጫት ጨምር
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
