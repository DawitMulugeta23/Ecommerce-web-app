// backend/controllers/analyticsController.js
import Comment from "../models/Comment.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

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

    // 1. Product Performance Data
    const productPerformance = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          productName: { $first: "$orderItems.name" },
          totalSold: { $sum: "$orderItems.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] },
          },
          averagePrice: { $avg: "$orderItems.price" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 20 },
    ]);

    // 2. Products with low stock (በክምችት ውስጥ ያሉ አነስተኛ ምርቶች)
    const lowStockProducts = await Product.find({
      countInStock: { $lt: 10 },
    })
      .select("name countInStock price category")
      .sort({ countInStock: 1 })
      .limit(20);

    // 3. Products not selling well (ለሽያጭ ያልበቁ ምርቶች)
    const soldProductIds = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startDate } } },
      { $unwind: "$orderItems" },
      { $group: { _id: "$orderItems.product" } },
    ]);

    const soldIds = soldProductIds.map((item) => item._id);

    const notSellingProducts = await Product.find({
      _id: { $nin: soldIds },
      createdAt: { $lte: startDate },
    })
      .select("name price category countInStock createdAt")
      .limit(20);

    // 4. Products with high demand (በከፍተኛ ፍላጎት ላይ ያሉ)
    const highDemandProducts = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          productName: { $first: "$orderItems.name" },
          totalSold: { $sum: "$orderItems.quantity" },
          revenue: {
            $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    // 5. Category performance
    const categoryPerformance = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          totalSold: { $sum: "$orderItems.quantity" },
          revenue: {
            $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] },
          },
          productCount: { $addToSet: "$orderItems.product" },
        },
      },
      {
        $project: {
          category: "$_id",
          totalSold: 1,
          revenue: 1,
          uniqueProducts: { $size: "$productCount" },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // 6. Monthly sales trend (for line chart)
    const monthlyTrend = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: {
            $gte: new Date(
              new Date().setFullYear(new Date().getFullYear() - 1),
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // 7. Product likes distribution
    const likeDistribution = await Product.aggregate([
      { $match: { likeCount: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgLikes: { $avg: "$likeCount" },
          maxLikes: { $max: "$likeCount" },
          totalLikes: { $sum: "$likeCount" },
          productsWithLikes: { $sum: 1 },
        },
      },
    ]);

    // 8. Comment analytics
    const commentAnalytics = await Comment.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalComments: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          totalLikes: { $sum: "$likeCount" },
        },
      },
    ]);

    // 9. Top rated products
    const topRatedProducts = await Product.find({ rating: { $gt: 0 } })
      .select("name price category rating numReviews likeCount")
      .sort({ rating: -1, numReviews: -1 })
      .limit(10);

    // 10. Daily sales for bar chart (last 30 days)
    const dailySales = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalSales: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts: await Product.countDocuments(),
          totalOrders: await Order.countDocuments({ isPaid: true }),
          totalRevenue:
            (
              await Order.aggregate([
                { $match: { isPaid: true } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } },
              ])
            )[0]?.total || 0,
          averageOrderValue:
            (
              await Order.aggregate([
                { $match: { isPaid: true } },
                { $group: { _id: null, avg: { $avg: "$totalPrice" } } },
              ])
            )[0]?.avg || 0,
        },
        productPerformance,
        lowStockProducts, // በክምችት ውስጥ ያሉ አነስተኛ ምርቶች
        notSellingProducts, // ለሽያጭ ያልበቁ ምርቶች (ባለፉት 30 ቀናት ያልተሸጡ)
        highDemandProducts, // በከፍተኛ ፍላጎት ላይ ያሉ ምርቶች
        categoryPerformance,
        monthlyTrend,
        likeDistribution: likeDistribution[0] || {
          avgLikes: 0,
          maxLikes: 0,
          totalLikes: 0,
          productsWithLikes: 0,
        },
        commentAnalytics: commentAnalytics[0] || {
          totalComments: 0,
          avgRating: 0,
          totalLikes: 0,
        },
        topRatedProducts,
        dailySales,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: error.message });
  }
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
              { $multiply: ["$likeCount", 2] }, // Likes weighted by 2
              { $ifNull: [{ $arrayElemAt: ["$salesData.totalSold", 0] }, 0] }, // Sales count
              {
                $cond: [
                  { $gt: ["$countInStock", 0] },
                  { $divide: [1, "$countInStock"] }, // Low stock increases demand score
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
