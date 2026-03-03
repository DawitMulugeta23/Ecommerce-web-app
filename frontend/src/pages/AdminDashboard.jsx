// client/src/pages/AdminDashboard.jsx
import {
  CreditCard,
  Edit,
  Eye,
  Heart,
  Package,
  Plus,
  Trash2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  deleteProduct,
  fetchProducts,
} from "../features/products/productSlice";
import API from "../services/api";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { items: products, loading: productsLoading } = useSelector(
    (state) => state.products,
  );
  const { user } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0,
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data } = await API.get("/payments/orders/admin/all");
      setOrders(data);
      setStats({
        totalOrders: data.length,
        revenue: data
          .filter((o) => o.isPaid)
          .reduce((acc, o) => acc + o.totalPrice, 0),
        totalUsers: new Set(data.map((o) => o.user?._id)).size,
      });
    } catch (err) {
      console.error("Failed to fetch orders", err);
      toast.error("Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  // ✅ FIXED: Delete product function
  const handleDeleteProduct = async (id, name) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-bold">Delete Product</p>
          <p>Are you sure you want to delete "{name}"?</p>
          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
              onClick={() => toast.dismiss(t.id)}
            >
              No
            </button>
            <button
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  // ✅ FIXED: Properly dispatch deleteProduct and handle response
                  const result = await dispatch(deleteProduct(id)).unwrap();
                  if (result) {
                    toast.success("Product deleted successfully!");
                  }
                } catch (err) {
                  // ✅ FIXED: Better error handling
                  console.error("Delete error:", err);
                  toast.error(
                    err?.message ||
                      err?.response?.data?.message ||
                      "Failed to delete product!",
                  );
                }
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      },
    );
  };

  const handleDeleteOrder = async (orderId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-bold text-red-600">⚠️ Permanent Delete</p>
          <p>
            Are you sure you want to permanently delete this order? This action
            cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
              onClick={() => toast.dismiss(t.id)}
            >
              No
            </button>
            <button
              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const response = await API.delete(
                    `/payments/orders/${orderId}`,
                    {
                      headers: { Authorization: `Bearer ${user.token}` },
                    },
                  );

                  if (response.data.success) {
                    toast.success("Order deleted successfully!");

                    // Remove the deleted order from the state immediately
                    setOrders((prevOrders) =>
                      prevOrders.filter((order) => order._id !== orderId),
                    );

                    // Update stats
                    setStats((prev) => ({
                      ...prev,
                      totalOrders: prev.totalOrders - 1,
                    }));
                  }
                } catch (err) {
                  toast.error(
                    err.response?.data?.message || "Failed to delete order",
                  );
                }
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      },
    );
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(
        `/payments/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      toast.success("Order status updated!");
      // Update the order in state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order,
        ),
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update order status",
      );
    }
  };

  const handleCancelOrder = async (orderId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-bold">Cancel Order</p>
          <p>Are you sure you want to cancel this order?</p>
          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
              onClick={() => toast.dismiss(t.id)}
            >
              No
            </button>
            <button
              className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await API.put(
                    `/payments/orders/${orderId}/cancel`,
                    {},
                    {
                      headers: { Authorization: `Bearer ${user.token}` },
                    },
                  );
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
                  toast.error(
                    err.response?.data?.message || "Failed to cancel order",
                  );
                }
              }}
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      },
    );
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Welcome back, Admin!
            </p>
          </div>
          <Link
            to="/admin/add-product"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg"
          >
            <Plus size={20} /> Add New Product
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Products
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {products.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <Package
                  className="text-blue-600 dark:text-blue-400"
                  size={24}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Orders
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                <CreditCard
                  className="text-green-600 dark:text-green-400"
                  size={24}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Users
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
                <Users
                  className="text-orange-600 dark:text-orange-400"
                  size={24}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Revenue
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {stats.revenue} ETB
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                <CreditCard
                  className="text-purple-600 dark:text-purple-400"
                  size={24}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold dark:text-white">Products List</h2>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Image
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Name
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Created By
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Likes
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Price
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Category
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Stock
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <td className="p-4">
                        <img
                          src={product.image}
                          alt=""
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      </td>
                      <td className="p-4 font-medium dark:text-white">
                        {product.name}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {product.user?.profilePicture ? (
                            <img
                              src={product.user.profilePicture}
                              alt={product.user.name}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <User size={16} className="text-gray-400" />
                          )}
                          <span className="text-sm dark:text-gray-300">
                            {product.user?.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Heart
                            size={16}
                            className="text-red-500 fill-red-500"
                          />
                          <span className="dark:text-white">
                            {product.likeCount || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                        {product.price} ETB
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        {product.category}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            product.countInStock > 10
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : product.countInStock > 0
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {product.countInStock}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/product/${product._id}`}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            to={`/admin/edit-product/${product._id}`}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          {/* ✅ Delete button with proper function */}
                          <button
                            onClick={() =>
                              handleDeleteProduct(product._id, product.name)
                            }
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!productsLoading && products.length === 0 && (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              No products found
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold dark:text-white">Recent Orders</h2>
            <button
              onClick={fetchOrders}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Refresh
            </button>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      ID
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Customer
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Total
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Status
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Payment
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Date
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-4 font-mono text-sm dark:text-gray-300">
                        #{order._id?.slice(-8) || "N/A"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {order.user?.profilePicture ? (
                            <img
                              src={order.user.profilePicture}
                              alt={order.user.name}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <User size={16} className="text-gray-400" />
                          )}
                          <span className="dark:text-gray-300">
                            {order.user?.name || order.user?.email || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-bold dark:text-white">
                        {order.totalPrice || 0} ETB
                      </td>
                      <td className="p-4">
                        <select
                          value={order.orderStatus || "pending"}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order._id, e.target.value)
                          }
                          className={`px-3 py-1 rounded-full text-xs font-bold border-0 cursor-pointer ${
                            order.orderStatus === "delivered"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : order.orderStatus === "cancelled"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : order.orderStatus === "shipped"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.isPaid
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {order.isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/order/${order._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>

                          {/* Show delete button for unpaid orders */}
                          {!order.isPaid && (
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                              title="Delete Order (Permanent)"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}

                          {/* Show cancel button for unpaid orders that aren't already cancelled */}
                          {!order.isPaid &&
                            order.orderStatus !== "cancelled" && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition"
                                title="Cancel Order"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              No orders found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
