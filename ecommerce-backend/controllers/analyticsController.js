// backend/controllers/analyticsController.js
import Comment from "../models/Comment.js";
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
    }).populate("orderItems.product");

    // Calculate summary
    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0,
    );
    const totalOrders = paidOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    // 1. Daily sales for line chart
    const dailySalesMap = new Map();
    const dateArray = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      dateArray.push(dateStr);
      dailySalesMap.set(dateStr, { totalSales: 0, orderCount: 0 });
    }

    paidOrders.forEach((order) => {
      const dateStr = order.createdAt.toISOString().split("T")[0];
      if (dailySalesMap.has(dateStr)) {
        const current = dailySalesMap.get(dateStr);
        dailySalesMap.set(dateStr, {
          totalSales: current.totalSales + order.totalPrice,
          orderCount: current.orderCount + 1,
        });
      }
    });

    const dailySales = Array.from(dailySalesMap, ([date, data]) => ({
      _id: date,
      totalSales: data.totalSales,
      orderCount: data.orderCount,
    })).sort((a, b) => a._id.localeCompare(b._id));

    // 2. Category performance
    const categoryMap = new Map();

    paidOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const category = item.product?.category || "Uncategorized";
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            revenue: 0,
            totalSold: 0,
            productCount: new Set(),
          });
        }
        const catData = categoryMap.get(category);
        catData.revenue += item.price * item.quantity;
        catData.totalSold += item.quantity;
        catData.productCount.add(item.product?._id?.toString());
      });
    });

    const categoryPerformance = Array.from(categoryMap, ([category, data]) => ({
      category,
      revenue: data.revenue,
      totalSold: data.totalSold,
      uniqueProducts: data.productCount.size,
    })).sort((a, b) => b.revenue - a.revenue);

    // 3. High demand products
    const productSalesMap = new Map();

    paidOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (!item.product) return;
        const productId = item.product._id.toString();
        if (!productSalesMap.has(productId)) {
          productSalesMap.set(productId, {
            _id: productId,
            productName: item.name,
            totalSold: 0,
            revenue: 0,
          });
        }
        const prodData = productSalesMap.get(productId);
        prodData.totalSold += item.quantity;
        prodData.revenue += item.price * item.quantity;
      });
    });

    const highDemandProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    // 4. Low stock products
    const lowStockProducts = await Product.find({
      countInStock: { $lt: 10, $gt: 0 },
    })
      .select("name countInStock price category image")
      .sort({ countInStock: 1 })
      .limit(20);

    // 5. Not selling products (products created before startDate with no sales)
    const soldProductIds = new Set();
    paidOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (item.product?._id) {
          soldProductIds.add(item.product._id.toString());
        }
      });
    });

    const notSellingProducts = await Product.find({
      _id: { $nin: Array.from(soldProductIds) },
      createdAt: { $lte: startDate },
    })
      .select("name price category countInStock createdAt image")
      .limit(20);

    // 6. Top rated products
    const topRatedProducts = await Product.find({ rating: { $gt: 0 } })
      .select("name price category rating numReviews likeCount image")
      .sort({ rating: -1, numReviews: -1 })
      .limit(10);

    // 7. Like analytics
    const productsWithLikes = await Product.find({ likeCount: { $gt: 0 } });
    const totalLikes = productsWithLikes.reduce(
      (sum, p) => sum + p.likeCount,
      0,
    );
    const avgLikes =
      productsWithLikes.length > 0 ? totalLikes / productsWithLikes.length : 0;

    // Get recent comments for analytics
    const recentComments = await Comment.find({
      createdAt: { $gte: startDate },
    }).populate("user", "name");

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
        dailySales,
        categoryPerformance,
        highDemandProducts,
        lowStockProducts,
        notSellingProducts,
        topRatedProducts,
        likeDistribution: {
          totalLikes,
          avgLikes: avgLikes.toFixed(1),
          productsWithLikes: productsWithLikes.length,
        },
        commentAnalytics: {
          totalComments: recentComments.length,
          avgRating: await getAverageRating(),
          totalLikes: recentComments.reduce(
            (sum, c) => sum + (c.likeCount || 0),
            0,
          ),
        },
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get average rating
const getAverageRating = async () => {
  const products = await Product.find({ rating: { $gt: 0 } });
  if (products.length === 0) return 0;
  const sum = products.reduce((acc, p) => acc + p.rating, 0);
  return (sum / products.length).toFixed(1);
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

    // Get products with their sales data
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
