// client/src/components/SalesAnalytics.jsx
import { Calendar, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
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

// Colors for charts
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

// Custom tooltip component - defined outside the main component
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
              {entry.name === "Revenue (ETB)"
                ? `${entry.value.toLocaleString()} ETB`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SalesAnalytics = ({
  weeklyData = [],
  dailyData = [],
  monthlyData = [],
}) => {
  const [activeTab, setActiveTab] = useState("daily");
  const [chartType, setChartType] = useState("bar");

  // Get data based on active tab
  const getChartData = () => {
    switch (activeTab) {
      case "weekly":
        return weeklyData.map((item) => ({
          ...item,
          name: item.label || `Week ${item.week}`,
          revenue: item.totalSales,
          orders: item.orderCount,
          avgOrder: item.averageOrderValue,
        }));
      case "monthly":
        return monthlyData.map((item) => ({
          ...item,
          name: item.label || `${item.month}/${item.year}`,
          revenue: item.totalSales,
          orders: item.orderCount,
          avgOrder: item.averageOrderValue,
        }));
      default:
        return dailyData.map((item) => ({
          ...item,
          name: item.label || item.date,
          revenue: item.totalSales,
          orders: item.orderCount,
          avgOrder: item.averageOrderValue,
        }));
    }
  };

  const data = getChartData();

  // Calculate summary statistics
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const bestDay =
    data.length > 0
      ? data.reduce(
          (max, item) => (item.revenue > max.revenue ? item : max),
          data[0],
        )
      : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      {/* Header */}
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
              onClick={() => setActiveTab("daily")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                activeTab === "daily"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Daily (30 Days)
            </button>
            <button
              onClick={() => setActiveTab("weekly")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                activeTab === "weekly"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                activeTab === "monthly"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white">
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
                Total Orders
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white">
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
                Avg Order Value
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                {avgOrderValue.toFixed(2)} ETB
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <Calendar className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Best{" "}
                {activeTab === "weekly"
                  ? "Week"
                  : activeTab === "monthly"
                    ? "Month"
                    : "Day"}
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                {bestDay ? bestDay.name : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {data.length > 0 ? (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart
                data={data}
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
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#3b82f6"
                  tick={{ fill: "#6B7280" }}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  tick={{ fill: "#6B7280" }}
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue (ETB)"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
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
                data={data}
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
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#3b82f6"
                  tick={{ fill: "#6B7280" }}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  tick={{ fill: "#6B7280" }}
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (ETB)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            No sales data available for this period
          </p>
        </div>
      )}

      {/* Data Table */}
      <div className="mt-8">
        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">
          {activeTab === "weekly"
            ? "Weekly"
            : activeTab === "monthly"
              ? "Monthly"
              : "Daily"}{" "}
          Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-left font-bold text-gray-600 dark:text-gray-300">
                  Period
                </th>
                <th className="p-3 text-right font-bold text-gray-600 dark:text-gray-300">
                  Revenue
                </th>
                <th className="p-3 text-right font-bold text-gray-600 dark:text-gray-300">
                  Orders
                </th>
                <th className="p-3 text-right font-bold text-gray-600 dark:text-gray-300">
                  Avg Order
                </th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-100 dark:border-gray-800"
                >
                  <td className="p-3 text-gray-800 dark:text-gray-200">
                    {item.name}
                  </td>
                  <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">
                    {item.revenue.toLocaleString()} ETB
                  </td>
                  <td className="p-3 text-right font-bold text-green-600 dark:text-green-400">
                    {item.orders}
                  </td>
                  <td className="p-3 text-right text-gray-600 dark:text-gray-400">
                    {item.avgOrder?.toFixed(2) || "0.00"} ETB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 10 && (
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
              Showing top 10 of {data.length} periods
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// EXPORT DEFAULT - THIS IS THE KEY LINE
export default SalesAnalytics;
