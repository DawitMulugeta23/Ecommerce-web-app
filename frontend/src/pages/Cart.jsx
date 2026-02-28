import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import { clearCartError, fetchCart } from "../features/cart/cartSlice";

const Cart = () => {
  const { items, totalAmount, error, loading } = useSelector(
    (state) => state.cart,
  );
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch cart when component mounts or user changes
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }

    if (error) {
      toast.error(error.message || "An error occurred");
      dispatch(clearCartError());
    }
  }, [user, dispatch, error]);

  // Calculate cart count for display
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            Shopping Cart
          </h1>
          {cartCount > 0 && (
            <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 p-16 rounded-3xl shadow-sm text-center border border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-xl mb-8">
              Your cart is empty!
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
            >
              Continue Shopping
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
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Items ({cartCount}):</span>
                    <span className="font-bold dark:text-white">
                      {cartCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span className="font-bold dark:text-white">
                      {totalAmount.toFixed(2)} ETB
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping:</span>
                    <span className="font-bold dark:text-green-600">Free</span>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between text-lg font-black">
                      <span>Total:</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {totalAmount.toFixed(2)} ETB
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg active:scale-95"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/"
                  className="block text-center mt-4 text-gray-500 hover:text-blue-600 text-sm font-bold transition"
                >
                  Continue Shopping
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
