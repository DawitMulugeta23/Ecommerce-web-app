import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import { clearCartError, fetchCart } from "../features/cart/cartSlice";

const Cart = () => {
  const { items, totalAmount, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }

    if (error) {
      toast.error(error.message || "ስህተት ተፈጥሯል");
      dispatch(clearCartError());
    }
  }, [user, dispatch, error]);

  const handleCheckout = () => {
    if (!user) {
      toast.error("እባክዎ በመጀመሪያ ይግቡ");
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
          የእርስዎ የገበያ ቅርጫት
        </h1>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 p-16 rounded-3xl shadow-sm text-center border border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-xl mb-8">
              ቅርጫቱ ባዶ ነው!
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
            >
              ወደ ገበያ ተመለስ
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
              <div className="space-y-2">
                {items.map((item) => (
                  <CartItem key={item._id || item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 sticky top-24">
                <h2 className="text-xl font-bold border-b dark:border-gray-700 pb-4 mb-4 dark:text-white">
                  የክፍያ ማጠቃለያ
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>አጠቃላይ እቃዎች:</span>
                    <span className="font-bold dark:text-white">
                      {items.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-black">
                    <span>ጠቅላላ ዋጋ:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {totalAmount.toFixed(2)} ETB
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg active:scale-95"
                >
                  ክፍያ ፈጽም
                </button>

                <Link
                  to="/"
                  className="block text-center mt-4 text-gray-500 hover:text-blue-600 text-sm font-bold transition"
                >
                  መግዛትን ቀጥል
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
