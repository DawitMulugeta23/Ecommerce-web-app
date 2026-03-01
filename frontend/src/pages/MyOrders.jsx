// client/src/pages/MyOrders.jsx
import { CheckCircle, Clock, Package, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useTheme } from "../context/useTheme";
import API from "../services/api";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/payments/orders");
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await API.put(`/payments/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully!");

      // Update the order status in state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, orderStatus: "cancelled" }
            : order,
        ),
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await API.delete(`/payments/orders/${orderId}`);
      toast.success("Order deleted successfully!");

      // Remove the deleted order from the state immediately (invisible from UI)
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId),
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete order");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="text-green-500" size={20} />;
      case "cancelled":
        return <XCircle className="text-red-500" size={20} />;
      case "processing":
        return <Clock className="text-blue-500" size={20} />;
      case "shipped":
        return <Clock className="text-purple-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
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

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-950 py-8 ${isDarkMode ? "dark" : ""}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Your Orders
          </h1>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition text-sm"
          >
            Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 p-16 rounded-3xl shadow-sm text-center border border-gray-100 dark:border-gray-800">
            <Package className="mx-auto h-20 w-20 text-gray-400 dark:text-gray-600 mb-6" />
            <p className="text-gray-500 dark:text-gray-400 text-xl mb-8">
              You haven't placed any orders yet!
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Order ID
                      </p>
                      <p className="font-mono font-bold text-sm dark:text-white">
                        #{order._id?.slice(-8) || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Date
                      </p>
                      <p className="font-bold text-sm dark:text-white">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Total
                      </p>
                      <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                        {order.totalPrice || 0} ETB
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Status
                      </p>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.orderStatus || "pending")}
                        <span
                          className={`font-bold capitalize text-sm ${getStatusColor(order.orderStatus || "pending")}`}
                        >
                          {order.orderStatus || "pending"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Payment
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.isPaid
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {order.isPaid ? "Paid" : "Unpaid"}
                        </span>

                        {/* Show delete button ONLY for unpaid orders */}
                        {!order.isPaid && (
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            title="Delete Order"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        {/* Show cancel button for unpaid orders that aren't already cancelled */}
                        {!order.isPaid && order.orderStatus !== "cancelled" && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition"
                            title="Cancel Order"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  {order.orderItems && order.orderItems.length > 0 ? (
                    <div className="space-y-4">
                      {order.orderItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <img
                            src={item.image || "/placeholder.jpg"}
                            alt={item.name || "Product"}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/64";
                            }}
                          />
                          <div className="flex-1">
                            <Link
                              to={`/product/${item.product?._id || "#"}`}
                              className="font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
                            >
                              {item.name || "Product"}
                            </Link>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Quantity: {item.quantity || 0} x {item.price || 0}{" "}
                              ETB
                            </p>
                          </div>
                          <div className="font-bold text-blue-600 dark:text-blue-400">
                            {(item.quantity || 0) * (item.price || 0)} ETB
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No items in this order
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
