// client/src/pages/AdminAnalytics.jsx (fixed version - removed unused user)
import {
  AlertTriangle,
  DollarSign,
  Heart,
  Package,
  ShoppingBag,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import API from "../services/api";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const AdminAnalytics = () => {
  // Removed unused 'user' variable
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedChart, setSelectedChart] = useState("sales");
  const [customXAxis, setCustomXAxis] = useState("product");
  const [customYAxis, setCustomYAxis] = useState("revenue");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(
        `/analytics/dashboard?timeRange=${timeRange}`,
      );
      setData(data.data);
    } catch (err) {
      toast.error("Failed to load analytics");
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Product performance and customer insights
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {["7days", "30days", "90days", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl font-bold transition ${
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {range === "7days" && "7 Days"}
                {range === "30days" && "30 Days"}
                {range === "90days" && "90 Days"}
                {range === "year" && "Year"}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Revenue
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {data.summary?.totalRevenue?.toLocaleString() || 0} ETB
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                <DollarSign
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
                  Total Orders
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {data.summary?.totalOrders || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <ShoppingBag
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
                  Average Order
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {data.summary?.averageOrderValue?.toFixed(2) || 0} ETB
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                <TrendingUp
                  className="text-purple-600 dark:text-purple-400"
                  size={24}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Products
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {data.summary?.totalProducts || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
                <Package
                  className="text-orange-600 dark:text-orange-400"
                  size={24}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Custom Chart Configuration */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Custom Chart Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Chart Type
              </label>
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              >
                <option value="sales">Sales Trend</option>
                <option value="category">Category Performance</option>
                <option value="demand">Product Demand</option>
                <option value="likes">Likes Distribution</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                X-Axis
              </label>
              <select
                value={customXAxis}
                onChange={(e) => setCustomXAxis(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              >
                <option value="product">Product</option>
                <option value="category">Category</option>
                <option value="date">Date</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Y-Axis
              </label>
              <select
                value={customYAxis}
                onChange={(e) => setCustomYAxis(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              >
                <option value="revenue">Revenue</option>
                <option value="sold">Units Sold</option>
                <option value="likes">Likes</option>
                <option value="stock">Stock Level</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
          <h2 className="text-xl font-bold mb-6 dark:text-white">
            {selectedChart === "sales" && "Daily Sales Trend"}
            {selectedChart === "category" && "Category Performance"}
            {selectedChart === "demand" && "Product Demand Analysis"}
            {selectedChart === "likes" && "Likes Distribution"}
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            {selectedChart === "sales" && (
              <AreaChart data={data.dailySales || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="totalSales"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Revenue (ETB)"
                />
                <Area
                  type="monotone"
                  dataKey="orderCount"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  name="Orders"
                />
              </AreaChart>
            )}

            {selectedChart === "category" && (
              <BarChart data={data.categoryPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill="#3b82f6"
                  name="Revenue (ETB)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="totalSold"
                  fill="#10b981"
                  name="Units Sold"
                />
              </BarChart>
            )}

            {selectedChart === "demand" && (
              <BarChart data={data.highDemandProducts || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="totalSold"
                  fill="#3b82f6"
                  name="Units Sold"
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  fill="#f59e0b"
                  name="Revenue"
                />
              </BarChart>
            )}

            {selectedChart === "likes" && (
              <PieChart>
                <Pie
                  data={data.topRatedProducts?.slice(0, 5) || []}
                  dataKey="likeCount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  label
                >
                  {(data.topRatedProducts?.slice(0, 5) || []).map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ),
                  )}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Product Status Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* High Demand Products */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
              <TrendingUp className="text-green-500" size={20} />
              High Demand Products (በከፍተኛ ፍላጎት ላይ ያሉ)
            </h3>
            <div className="space-y-4">
              {data.highDemandProducts?.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold dark:text-white">
                      {product.productName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.totalSold} units sold
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-bold">
                    {product.revenue} ETB
                  </span>
                </div>
              ))}
              {(!data.highDemandProducts ||
                data.highDemandProducts.length === 0) && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No high demand products
                </p>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
              <AlertTriangle className="text-orange-500" size={20} />
              Low Stock Products (በክምችት ውስጥ ያሉ አነስተኛ)
            </h3>
            <div className="space-y-4">
              {data.lowStockProducts?.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Category: {product.category}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      product.countInStock <= 3
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {product.countInStock} left
                  </span>
                </div>
              ))}
              {(!data.lowStockProducts ||
                data.lowStockProducts.length === 0) && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No low stock products
                </p>
              )}
            </div>
          </div>

          {/* Not Selling Products */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
              <TrendingDown className="text-red-500" size={20} />
              Not Selling (ለሽያጭ ያልበቁ)
            </h3>
            <div className="space-y-4">
              {data.notSellingProducts?.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Added: {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm font-bold">
                    {product.countInStock} in stock
                  </span>
                </div>
              ))}
              {(!data.notSellingProducts ||
                data.notSellingProducts.length === 0) && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  All products are selling
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top Rated Products */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
            <Star className="text-yellow-500 fill-yellow-500" size={20} />
            Top Rated Products
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {data.topRatedProducts?.map((product) => (
              <div key={product._id} className="text-center">
                <div className="mb-2">
                  <div className="flex justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= Math.round(product.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {product.numReviews || 0} reviews
                  </p>
                </div>
                <p className="font-bold text-sm dark:text-white truncate">
                  {product.name}
                </p>
                <p className="text-blue-600 font-bold">{product.price} ETB</p>
              </div>
            ))}
            {(!data.topRatedProducts || data.topRatedProducts.length === 0) && (
              <p className="text-gray-500 dark:text-gray-400 col-span-5 text-center py-4">
                No rated products yet
              </p>
            )}
          </div>
        </div>

        {/* Like Analytics */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
            <Heart className="text-red-500 fill-red-500" size={20} />
            Like Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {data.likeDistribution?.totalLikes || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Likes
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {data.likeDistribution?.avgLikes?.toFixed(1) || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Average Likes per Product
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {data.likeDistribution?.productsWithLikes || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Products with Likes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
