// client/src/pages/OrderDetails.jsx
import { CheckCircle, Clock, Package, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/payments/orders/${id}`);
      setOrder(data);
    } catch (err) {
      toast.error("Failed to fetch order details");
      console.error(err);
      navigate("/my-orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="text-green-500" size={24} />;
      case "cancelled":
        return <XCircle className="text-red-500" size={24} />;
      case "processing":
        return <Clock className="text-blue-500" size={24} />;
      case "shipped":
        return <Clock className="text-purple-500" size={24} />;
      default:
        return <Clock className="text-yellow-500" size={24} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "shipped":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Package className="h-20 w-20 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Order Not Found
        </h2>
        <Link
          to="/my-orders"
          className="text-blue-600 hover:underline font-bold"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Order Details
          </h1>
          <Link
            to="/my-orders"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            Back to Orders
          </Link>
        </div>

        {/* Order Info Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Order ID
              </p>
              <p className="font-mono font-bold text-gray-900 dark:text-white break-all">
                #{order._id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Date
              </p>
              <p className="font-bold text-gray-900 dark:text-white">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Order Status
              </p>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.orderStatus)}
                <span
                  className={`font-bold capitalize px-3 py-1 rounded-full text-sm ${getStatusColor(
                    order.orderStatus,
                  )}`}
                >
                  {order.orderStatus}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Payment Status
              </p>
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  order.isPaid
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {order.isPaid ? "Paid" : "Unpaid"}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Name
              </p>
              <p className="font-bold dark:text-white">
                {order.shippingAddress?.fullName || order.user?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Email
              </p>
              <p className="font-bold dark:text-white break-all">
                {order.user?.email || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Phone
              </p>
              <p className="font-bold dark:text-white">
                {order.shippingAddress?.phone || order.phone || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Address
              </p>
              <p className="font-bold dark:text-white">
                {order.shippingAddress?.address || "N/A"},{" "}
                {order.shippingAddress?.city || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Order Items
          </h2>

          {order.orderItems && order.orderItems.length > 0 ? (
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <img
                    src={item.image || "/placeholder.jpg"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80";
                    }}
                  />
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.product?._id || "#"}`}
                      className="font-bold text-gray-800 dark:text-white hover:text-blue-600 transition"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Quantity: {item.quantity} x {item.price} ETB
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {(item.quantity * item.price).toLocaleString()} ETB
                    </p>
                  </div>
                </div>
              ))}

              {/* Order Summary */}
              <div className="border-t dark:border-gray-700 pt-4 mt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold dark:text-white">Subtotal:</span>
                  <span className="dark:text-white">
                    {order.totalPrice?.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg mt-2">
                  <span className="font-bold dark:text-white">Shipping:</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black mt-4 pt-4 border-t dark:border-gray-700">
                  <span className="dark:text-white">Total:</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {order.totalPrice?.toLocaleString()} ETB
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No items in this order
            </p>
          )}
        </div>

        {/* Actions */}
        {!order.isPaid && order.orderStatus !== "cancelled" && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={async () => {
                if (
                  window.confirm("Are you sure you want to cancel this order?")
                ) {
                  try {
                    await API.put(`/payments/orders/${order._id}/cancel`);
                    toast.success("Order cancelled successfully!");
                    fetchOrderDetails();
                  } catch (err) {
                    toast.error(
                      err.response?.data?.message || "Failed to cancel order",
                    );
                  }
                }
              }}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition shadow-lg"
            >
              Cancel Order
            </button>
          </div>
        )}

        {/* Back to top button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition"
          >
            ↑ Back to top
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
