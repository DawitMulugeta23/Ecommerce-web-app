// client/src/pages/Success.jsx
import { CheckCircle, Loader2, Sparkles, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { clearCart } from "../features/cart/cartSlice";
import API from "../services/api";

const Success = () => {
  const [status, setStatus] = useState("verifying");
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const tx_ref = searchParams.get("trx_id") || searchParams.get("tx_ref");
  const isDemo = location.state?.isDemo || false;
  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    let isMounted = true; // To prevent state updates if component unmounts

    const handleDemoPayment = () => {
      if (isMounted) {
        setStatus("success");
        dispatch(clearCart());
      }
    };

    const verifyRealPayment = async () => {
      if (!tx_ref) {
        if (isMounted) setStatus("error");
        return;
      }

      try {
        const { data } = await API.get(`/payments/verify/${tx_ref}`);

        if (isMounted) {
          if (data.data.status === "success") {
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
    };

    // Handle payment verification based on type
    if (isDemo) {
      handleDemoPayment();
    } else {
      verifyRealPayment();
    }

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [tx_ref, dispatch, isDemo]); // Dependencies array

  // Loading state
  if (status === "verifying" && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 dark:bg-gray-950 px-4">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          ክፍያዎን በማረጋገጥ ላይ ነን...
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          እባክዎ ለጥቂት ሰከንዶች ይጠብቁ።
        </p>
      </div>
    );
  }

  // Demo success state
  if (isDemo && status === "success") {
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

        {orderDetails && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl mb-8 max-w-md w-full">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Demo Order Summary:
            </p>
            <div className="space-y-1">
              <p className="text-sm text-gray-800 dark:text-white">
                <span className="font-bold">Total:</span> {orderDetails.amount}{" "}
                ETB
              </p>
              <p className="text-sm text-gray-800 dark:text-white">
                <span className="font-bold">Items:</span>{" "}
                {orderDetails.items?.length || 0}
              </p>
              <p className="text-sm text-gray-800 dark:text-white">
                <span className="font-bold">Customer:</span>{" "}
                {orderDetails.firstName} {orderDetails.lastName}
              </p>
            </div>
          </div>
        )}

        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
          Thank you for testing our demo! You can continue shopping or place a
          real order.
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
        <Link
          to="/"
          className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          ወደ ገበያ ተመለስ
        </Link>
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
