import { CheckCircle, Clock, Package, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // Removed unused user variable

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/payments/orders");
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="text-green-500" size={20} />;
      case "cancelled":
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-500 text-xl mb-6">
            You haven't placed any orders yet!
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono font-bold">{order._id.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-bold">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-blue-600">
                    {order.totalPrice} ETB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(order.orderStatus)}
                    <span className="font-bold capitalize">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.isPaid
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex gap-4 py-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {item.price} ETB
                      </p>
                    </div>
                    <div className="font-bold">
                      {item.quantity * item.price} ETB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
