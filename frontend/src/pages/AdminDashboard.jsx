import {
  CreditCard,
  Edit,
  Eye,
  Package,
  Plus,
  Trash2,
  Users,
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

  // State for orders data only
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0,
  });

  // 1. Fetch products via Redux (already in useEffect of the slice)
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // 2. Fetch orders separately
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/payments/orders/admin/all");
        setOrders(data.slice(0, 5)); // Store only recent 5 for display
        // Calculate stats from fetched orders
        setStats({
          totalOrders: data.length,
          revenue: data
            .filter((o) => o.isPaid)
            .reduce((acc, o) => acc + o.totalPrice, 0),
          totalUsers: new Set(data.map((o) => o.user?._id)).size, // Count unique users from orders
        });
      } catch (err) {
        console.error("Failed to fetch orders", err);
        toast.error("Could not load orders");
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []); // Empty dependency array - runs once on mount

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        toast.success("Product deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete product!");
        console.error(err.message)
      }
    }
  };

  // Derive total products directly from Redux state
  const totalProducts = products.length;

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-2">Welcome back, Admin!</p>
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <p className="text-3xl font-black text-gray-900">
                  {totalProducts}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-3xl font-black text-gray-900">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <CreditCard className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-black text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Users className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-3xl font-black text-gray-900">
                  {stats.revenue} ETB
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <CreditCard className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Products List</h2>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-sm font-bold text-gray-600">
                      Image
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600">
                      Name
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600">
                      Price
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600">
                      Category
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600">
                      Stock
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="p-4">
                        <img
                          src={product.image}
                          alt=""
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      </td>
                      <td className="p-4 font-medium">{product.name}</td>
                      <td className="p-4 font-bold text-blue-600">
                        {product.price} ETB
                      </td>
                      <td className="p-4 text-gray-600">{product.category}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            product.countInStock > 10
                              ? "bg-green-100 text-green-700"
                              : product.countInStock > 0
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.countInStock}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/product/${product._id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            to={`/admin/edit-product/${product._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(product._id, product.name)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
            <div className="text-center py-20 text-gray-500">
              No products found
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Recent Orders</h2>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-sm font-bold text-gray-600">
                      ID
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600">
                      Customer
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600">
                      Total
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600">
                      Status
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600">
                      Payment
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-t border-gray-100">
                      <td className="p-4 font-mono text-sm">
                        {order._id.slice(-8)}
                      </td>
                      <td className="p-4">
                        {order.user?.name || order.user?.email || "N/A"}
                      </td>
                      <td className="p-4 font-bold">{order.totalPrice} ETB</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.orderStatus === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.orderStatus === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.isPaid
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              No orders found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
