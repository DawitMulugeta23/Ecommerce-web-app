// client/src/pages/AdminAnalyticsPage.jsx
import {
  BarChart3,
  DollarSign,
  LineChart as LineChartIcon,
  Package,
  PieChart,
  RefreshCw,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
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
  "#84cc16",
  "#14b8a6",
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
              {entry.name.includes("Revenue") ||
              entry.name.includes("Sales") ||
              entry.name.includes("Value")
                ? `${entry.value?.toLocaleString() || 0} ETB`
                : entry.value?.toLocaleString() || 0}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AdminAnalyticsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState("30days");
  const [salesView, setSalesView] = useState("daily");
  const [chartType, setChartType] = useState("bar");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast.success("Analytics refreshed!");
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
  const totalRevenue = salesData.reduce(
    (sum, item) => sum + (item.revenue || 0),
    0,
  );
  const totalOrders = salesData.reduce(
    (sum, item) => sum + (item.orders || 0),
    0,
  );
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Filter category data
  const getFilteredCategoryData = () => {
    if (!data?.categoryPerformance) return [];

    let filtered = data.categoryPerformance;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) =>
        item.category?.toLowerCase().includes(selectedCategory.toLowerCase()),
      );
    }

    return filtered.slice(0, 8);
  };

  const categoryData = getFilteredCategoryData();

  if (!user || user.role !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-50 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="text-blue-600" size={32} />
              Analytics Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Welcome back, {user?.name}! Here's your store performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
            <Link
              to="/admin"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
            >
              <Package size={18} />
              Dashboard
            </Link>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
              Time Range:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "7days", label: "Last 7 Days" },
                { value: "30days", label: "Last 30 Days" },
                { value: "90days", label: "Last 90 Days" },
                { value: "year", label: "Last Year" },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-lg font-bold transition text-sm ${
                    timeRange === range.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <LineChartIcon className="text-blue-600" size={24} />
                Sales Analysis
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Track your sales performance over time
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                <PieChart className="text-blue-600" size={20} />
                Category Performance
              </h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 border-none outline-none"
              >
                <option value="all">All Categories</option>
                {categoryData.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>

            {categoryData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                    margin={{ left: 80, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <YAxis
                      dataKey="category"
                      type="category"
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">
                  No category data available
                </p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              Top Selling Products
            </h3>

            {data?.highDemandProducts?.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {data.highDemandProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-lg font-bold text-gray-400 w-6">
                        {index + 1}
                      </span>
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.productName}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-bold dark:text-white text-sm">
                          {product.productName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.totalSold} sold
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-blue-600">
                      {product.revenue?.toLocaleString()} ETB
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">
                  No product data available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Daily Sales Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            Daily Sales Trend
          </h3>

          {data?.dailySales?.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailySales.slice(-30)}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="_id"
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
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
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">
                No daily sales data available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
