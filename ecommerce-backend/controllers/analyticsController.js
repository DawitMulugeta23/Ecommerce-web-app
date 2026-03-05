// backend/controllers/analyticsController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// @desc    Get analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
export const getAnalyticsDashboard = async (req, res) => {
  try {
    const { timeRange = "30days" } = req.query;

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "7days":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get all paid orders in date range
    const paidOrders = await Order.find({
      isPaid: true,
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate("orderItems.product")
      .sort({ createdAt: 1 });

    // Calculate summary
    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0,
    );
    const totalOrders = paidOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    // 1. WEEKLY SALES ANALYSIS
    const weeklySales = await getWeeklySales(startDate, endDate);

    // 2. 30-DAY SALES ANALYSIS
    const dailySales = await getDailySales(startDate, endDate);

    // 3. YEARLY/MONTHLY SALES ANALYSIS
    const monthlySales = await getMonthlySales(startDate, endDate);

    // 4. Category performance
    const categoryPerformance = await getCategoryPerformance(paidOrders);

    // 5. High demand products
    const highDemandProducts = await getHighDemandProducts(paidOrders);

    // 6. Low stock products
    const lowStockProducts = await Product.find({
      countInStock: { $lt: 10, $gt: 0 },
    })
      .select("name countInStock price category image")
      .sort({ countInStock: 1 })
      .limit(20);

    // 7. Top rated products
    const topRatedProducts = await Product.find({ rating: { $gt: 0 } })
      .select("name price category rating numReviews likeCount image")
      .sort({ rating: -1, numReviews: -1 })
      .limit(10);

    // 8. Like analytics
    const productsWithLikes = await Product.find({ likeCount: { $gt: 0 } });
    const totalLikes = productsWithLikes.reduce(
      (sum, p) => sum + p.likeCount,
      0,
    );
    const avgLikes =
      productsWithLikes.length > 0 ? totalLikes / productsWithLikes.length : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalOrders,
          totalRevenue,
          averageOrderValue,
          totalUsers,
        },
        weeklySales,
        dailySales,
        monthlySales,
        categoryPerformance,
        highDemandProducts,
        lowStockProducts,
        topRatedProducts,
        likeDistribution: {
          totalLikes,
          avgLikes: avgLikes.toFixed(1),
          productsWithLikes: productsWithLikes.length,
        },
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get weekly sales
const getWeeklySales = async (startDate, endDate) => {
  const weeklyData = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        },
        weekStart: { $min: "$createdAt" },
        weekEnd: { $max: "$createdAt" },
        totalSales: { $sum: "$totalPrice" },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: "$totalPrice" },
      },
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        week: "$_id.week",
        weekStart: 1,
        weekEnd: 1,
        totalSales: 1,
        orderCount: 1,
        averageOrderValue: { $round: ["$averageOrderValue", 2] },
        label: {
          $concat: [
            "Week ",
            { $toString: "$_id.week" },
            " (",
            {
              $dateToString: { format: "%b %d", date: "$weekStart" },
            },
            " - ",
            {
              $dateToString: { format: "%b %d", date: "$weekEnd" },
            },
            ")",
          ],
        },
      },
    },
  ]);

  return weeklyData;
};

// Helper function to get daily sales for last 30/90 days
const getDailySales = async (startDate, endDate) => {
  const dailyData = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        date: { $first: "$createdAt" },
        totalSales: { $sum: "$totalPrice" },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id",
        fullDate: "$date",
        totalSales: 1,
        orderCount: 1,
        averageOrderValue: { $round: ["$averageOrderValue", 2] },
        dayOfWeek: { $dayOfWeek: "$date" },
        month: { $month: "$date" },
        day: { $dayOfMonth: "$date" },
        label: {
          $dateToString: { format: "%b %d, %Y", date: "$date" },
        },
      },
    },
  ]);

  return dailyData;
};

// Helper function to get monthly/yearly sales
const getMonthlySales = async (startDate, endDate) => {
  const monthlyData = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        monthStart: { $min: "$createdAt" },
        totalSales: { $sum: "$totalPrice" },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: "$totalPrice" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        totalSales: 1,
        orderCount: 1,
        averageOrderValue: { $round: ["$averageOrderValue", 2] },
        label: {
          $concat: [
            { $dateToString: { format: "%b", date: "$monthStart" } },
            " ",
            { $toString: "$_id.year" },
          ],
        },
        shortLabel: {
          $dateToString: { format: "%b", date: "$monthStart" },
        },
      },
    },
  ]);

  return monthlyData;
};

// Helper function to get category performance
const getCategoryPerformance = async (paidOrders) => {
  const categoryMap = new Map();

  paidOrders.forEach((order) => {
    order.orderItems.forEach((item) => {
      const category = item.product?.category || "Uncategorized";
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { revenue: 0, totalSold: 0, orders: 0 });
      }
      const catData = categoryMap.get(category);
      catData.revenue += item.price * item.quantity;
      catData.totalSold += item.quantity;
      catData.orders += 1;
    });
  });

  return Array.from(categoryMap, ([category, data]) => ({
    category,
    revenue: data.revenue,
    totalSold: data.totalSold,
    orders: data.orders,
    averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
  })).sort((a, b) => b.revenue - a.revenue);
};

// Helper function to get high demand products
const getHighDemandProducts = async (paidOrders) => {
  const productMap = new Map();

  paidOrders.forEach((order) => {
    order.orderItems.forEach((item) => {
      if (!item.product) return;
      const productId = item.product._id.toString();
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          _id: productId,
          productName: item.name,
          totalSold: 0,
          revenue: 0,
          orders: 0,
          image: item.image,
        });
      }
      const prodData = productMap.get(productId);
      prodData.totalSold += item.quantity;
      prodData.revenue += item.price * item.quantity;
      prodData.orders += 1;
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 10);
};

// @desc    Get product demand analysis
// @route   GET /api/analytics/demand
// @access  Private/Admin
export const getProductDemandAnalysis = async (req, res) => {
  try {
    const { category, sortBy = "demand" } = req.query;

    const matchStage = {};
    if (category) {
      matchStage.category = category;
    }

    const demandAnalysis = await Product.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                isPaid: true,
                $expr: { $in: ["$$productId", "$orderItems.product"] },
              },
            },
            { $unwind: "$orderItems" },
            {
              $match: {
                $expr: { $eq: ["$orderItems.product", "$$productId"] },
              },
            },
            {
              $group: {
                _id: null,
                totalSold: { $sum: "$orderItems.quantity" },
                revenue: {
                  $sum: {
                    $multiply: ["$orderItems.quantity", "$orderItems.price"],
                  },
                },
                lastSold: { $max: "$createdAt" },
              },
            },
          ],
          as: "salesData",
        },
      },
      {
        $addFields: {
          totalSold: {
            $ifNull: [{ $arrayElemAt: ["$salesData.totalSold", 0] }, 0],
          },
          revenue: {
            $ifNull: [{ $arrayElemAt: ["$salesData.revenue", 0] }, 0],
          },
          lastSold: {
            $ifNull: [{ $arrayElemAt: ["$salesData.lastSold", 0] }, null],
          },
          demandScore: {
            $add: [
              { $multiply: ["$likeCount", 2] },
              { $ifNull: [{ $arrayElemAt: ["$salesData.totalSold", 0] }, 0] },
              {
                $cond: [
                  { $gt: ["$countInStock", 0] },
                  { $divide: [10, "$countInStock"] },
                  0,
                ],
              },
            ],
          },
        },
      },
      { $sort: sortBy === "demand" ? { demandScore: -1 } : { totalSold: -1 } },
    ]);

    res.json({
      success: true,
      data: demandAnalysis,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
