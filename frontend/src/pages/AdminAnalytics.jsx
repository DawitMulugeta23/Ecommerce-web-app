// client/src/pages/AdminAnalytics.jsx
import {
  AlertTriangle,
  DollarSign,
  Heart,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import API from "../services/api";

// Colors for charts
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#d946ef",
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-gray-600 dark:text-gray-400">
              {entry.name}:
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {entry.name.includes("Revenue") || entry.name.includes("Sales")
                ? `${entry.value.toLocaleString()} ETB`
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState("30days");
  const [salesView, setSalesView] = useState("daily"); // daily, weekly, monthly
  const [chartType, setChartType] = useState("bar");

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAnalytics();
    }
  }, [timeRange, user]);

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

  // Process sales data based on view
  const getSalesData = () => {
    if (!data) return [];

    switch (salesView) {
      case "weekly":
        return (data.weeklySales || []).map((item) => ({
          ...item,
          name: item.label || `Week ${item.week}`,
          revenue: item.totalSales || 0,
          orders: item.orderCount || 0,
        }));
      case "monthly":
        return (data.monthlySales || []).map((item) => ({
          ...item,
          name: item.label || `${item.month}/${item.year}`,
          revenue: item.totalSales || 0,
          orders: item.orderCount || 0,
        }));
      default:
        return (data.dailySales || []).map((item) => ({
          ...item,
          name: item.label || item.date,
          revenue: item.totalSales || 0,
          orders: item.orderCount || 0,
        }));
    }
  };

  const salesData = getSalesData();
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (!user || user.role !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-50"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Welcome back, {user?.name}! Here's your store performance.
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-900 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            {[
              { value: "7days", label: "7D" },
              { value: "30days", label: "30D" },
              { value: "90days", label: "90D" },
              { value: "year", label: "1Y" },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg font-bold transition text-sm ${
                  timeRange === range.value
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  Total Revenue
                </p>
                <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  {data?.summary?.totalRevenue?.toLocaleString() || 0} ETB
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

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  Total Orders
                </p>
                <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  {data?.summary?.totalOrders || 0}
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

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  Avg Order Value
                </p>
                <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  {data?.summary?.averageOrderValue?.toFixed(2) || 0} ETB
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

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  Total Products
                </p>
                <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  {data?.summary?.totalProducts || 0}
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

        {/* Sales Analysis Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8">
          {/* Sales Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={24} />
                Sales Analysis
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Track your sales performance over time
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              {/* Time Period Tabs */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setSalesView("daily")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    salesView === "daily"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setSalesView("weekly")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    salesView === "weekly"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setSalesView("monthly")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    salesView === "monthly"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Monthly
                </button>
              </div>

              {/* Chart Type Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    chartType === "bar"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartType("line")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    chartType === "line"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Line
                </button>
              </div>
            </div>
          </div>

          {/* Sales Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Period Revenue
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {totalRevenue.toLocaleString()} ETB
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Period Orders
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Avg Order
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {avgOrderValue.toFixed(2)} ETB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart */}
          {salesData.length > 0 ? (
            <div className="h-80 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart
                    data={salesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      opacity={0.1}
                    />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="#3b82f6"
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#10b981"
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      name="Revenue (ETB)"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    >
                      {salesData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                    <Bar
                      yAxisId="right"
                      dataKey="orders"
                      name="Orders"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <LineChart
                    data={salesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      opacity={0.1}
                    />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="#3b82f6"
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#10b981"
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue (ETB)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      name="Orders"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">
                No sales data available for this period
              </p>
            </div>
          )}
        </div>

        {/* Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Performance Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
              <Package className="text-blue-600" size={20} />
              Category Performance
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.categoryPerformance?.slice(0, 6) || []}
                  layout="vertical"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                  />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              Top Products
            </h3>
            <div className="space-y-4">
              {data?.highDemandProducts?.slice(0, 5).map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-6">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold dark:text-white text-sm">
                        {product.productName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.totalSold} units sold
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {product.revenue?.toLocaleString()} ETB
                  </span>
                </div>
              ))}
              {(!data?.highDemandProducts ||
                data.highDemandProducts.length === 0) && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No sales data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product Status Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Low Stock Products */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
              <AlertTriangle className="text-orange-500" size={20} />
              Low Stock Products
            </h3>
            <div className="space-y-4">
              {data?.lowStockProducts?.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold dark:text-white text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {product.category}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      product.countInStock <= 3
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {product.countInStock} left
                  </span>
                </div>
              ))}
              {(!data?.lowStockProducts ||
                data.lowStockProducts.length === 0) && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No low stock products
                </p>
              )}
            </div>
          </div>

          {/* Top Rated Products */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
              <Star className="text-yellow-500 fill-yellow-500" size={20} />
              Top Rated Products
            </h3>
            <div className="space-y-4">
              {data?.topRatedProducts?.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold dark:text-white text-sm">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < Math.round(product.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.numReviews || 0})
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {product.price} ETB
                  </span>
                </div>
              ))}
              {(!data?.topRatedProducts ||
                data.topRatedProducts.length === 0) && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No rated products yet
                </p>
              )}
            </div>
          </div>

          {/* Like Analytics */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
              <Heart className="text-red-500 fill-red-500" size={20} />
              Like Analytics
            </h3>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {data?.likeDistribution?.totalLikes || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Likes
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {data?.likeDistribution?.avgLikes?.toFixed(1) || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Avg per Product
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {data?.likeDistribution?.productsWithLikes || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Products with Likes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Sales Trend Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            Daily Sales Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailySales?.slice(-30) || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.1}
                />
                <XAxis dataKey="_id" tick={{ fill: "#6B7280", fontSize: 11 }} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="totalSales"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  name="Revenue (ETB)"
                />
                <Area
                  type="monotone"
                  dataKey="orderCount"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
