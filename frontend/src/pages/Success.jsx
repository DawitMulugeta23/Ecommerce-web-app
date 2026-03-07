// client/src/pages/Success.jsx
import { CheckCircle, Loader2, Sparkles, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { clearCart } from "../features/cart/cartSlice";
import API from "../services/api";

const Success = () => {
  const [status, setStatus] = useState("verifying");
  const [order, setOrder] = useState(null);
  const [searchParams] = useSearchParams();
  const { id } = useParams(); // Get order ID from URL
  const location = useLocation();
  const dispatch = useDispatch();

  const tx_ref = searchParams.get("trx_id") || searchParams.get("tx_ref");
  const isDemo = location.state?.isDemo || false;
  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    let isMounted = true;

    const verifyOrder = async () => {
      // If we have order details from state (demo payment), use those
      if (orderDetails) {
        if (isMounted) {
          setOrder(orderDetails);
          setStatus("success");
          dispatch(clearCart());
        }
        return;
      }

      // If we have an order ID from URL params, fetch it
      if (id) {
        try {
          const { data } = await API.get(`/payments/orders/${id}`);
          if (isMounted) {
            setOrder(data);
            setStatus(data.isPaid ? "success" : "pending");
            if (data.isPaid) {
              dispatch(clearCart());
            }
          }
        } catch (err) {
          console.error("Error fetching order:", err);
          if (isMounted) setStatus("error");
        }
        return;
      }

      // Fallback to tx_ref verification
      if (tx_ref) {
        try {
          const { data } = await API.get(`/payments/verify/${tx_ref}`);
          if (isMounted) {
            if (data.data?.status === "success") {
              setStatus("success");
              dispatch(clearCart());
            } else {
              setStatus("error");
            }
          }
        } catch (err) {
          console.error("Verification Error:", err);
          if (isMounted) setStatus("error");
        }
      } else {
        if (isMounted) setStatus("error");
      }
    };

    verifyOrder();

    return () => {
      isMounted = false;
    };
  }, [tx_ref, id, dispatch, orderDetails]);

  // Loading state
  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 dark:bg-gray-950 px-4">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Verifying your order...
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Please wait a moment.
        </p>
      </div>
    );
  }

  // Demo success state
  if (isDemo && status === "success" && order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 dark:bg-gray-950 px-4">
        <div className="relative">
          <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
          <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 text-center">
          🧪 Demo Payment Successful!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
          This was a demo transaction. No real money was charged.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl mb-8 max-w-md w-full">
          <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white">
            Order Details
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-bold">Order ID:</span> #{order._id?.slice(-8) || "N/A"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-bold">Total:</span> {order.totalPrice} ETB
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-bold">Items:</span> {order.orderItems?.length || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-bold">Status:</span> {order.orderStatus}
            </p>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
          Thank you for testing our demo! Your order has been saved to your order history.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
          >
            Continue Shopping
          </Link>
          <Link
            to="/my-orders"
            className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  // Real payment success
  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 dark:bg-gray-950 px-4">
        <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 text-center">
          እንኳን ደስ አለዎት!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
          ክፍያዎ በተሳካ ሁኔታ ተፈጽሟል። ትዕዛዝዎ አሁን እየተዘጋጀ ነው።
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/my-orders"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 dark:bg-gray-950 px-4">
      <XCircle className="w-20 h-20 text-red-500 mb-6" />
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center">
        ክፍያው አልተረጋገጠም
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
        ይቅርታ፣ የክፍያ መረጃውን ማረጋገጥ አልቻልንም። ችግር ካለ እባክዎ በ contact ገጻችን ያሳውቁን።
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          to="/checkout"
          className="bg-gray-800 dark:bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-900 dark:hover:bg-gray-800 transition"
        >
          እንደገና ሞክር
        </Link>
        <Link
          to="/contact"
          className="border-2 border-gray-300 dark:border-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          እገዛ ፈልግ
        </Link>
      </div>
    </div>
  );
};

export default Success;