// backend/controllers/productController.js
import Cart from "../models/Cart.js";
import Comment from "../models/Comment.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// @desc    Get all products - Filter out zero stock for non-admin users
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    let products = await Product.find({})
      .populate("user", "name email profilePicture")
      .sort({ createdAt: -1 });

    // Check if user is admin (from auth middleware)
    const isAdmin = req.user && req.user.role === "admin";

    // If not admin, filter out products with zero stock
    if (!isAdmin) {
      products = products.filter((product) => product.countInStock > 0);
    }

    res.json(products);
  } catch (error) {
    console.error("Error in getProducts:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID - Check stock visibility
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "user",
      "name email profilePicture",
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    // Check if user is admin
    const isAdmin = req.user && req.user.role === "admin";

    // If product has zero stock and user is not admin, hide it
    if (product.countInStock === 0 && !isAdmin) {
      return res.status(404).json({ message: "Product not available!" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error in getProductById:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products for admin (including zero stock)
// @route   GET /api/products/admin/all
// @access  Private/Admin
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("user", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Error in getAllProductsAdmin:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get zero stock products for admin
// @route   GET /api/products/zero-stock
// @access  Private/Admin
export const getZeroStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ countInStock: 0 })
      .populate("user", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Error in getZeroStockProducts:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, countInStock } = req.body;

    const product = await Product.create({
      name,
      price: parseFloat(price),
      description,
      category,
      countInStock: parseInt(countInStock),
      image: req.file ? req.file.path : req.body.image,
      user: req.user._id,
    });

    const populatedProduct = await Product.findById(product._id).populate(
      "user",
      "name email profilePicture",
    );

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.countInStock =
      req.body.countInStock !== undefined
        ? req.body.countInStock
        : product.countInStock;
    product.image = req.body.image || product.image;
    product.oldPrice = req.body.oldPrice || product.oldPrice;

    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(
      updatedProduct._id,
    ).populate("user", "name email profilePicture");

    res.json(populatedProduct);
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product (soft delete - just set stock to 0)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if user exists in request
    if (!req.user) {
      console.log("❌ No user found in request");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Please login again",
      });
    }

    console.log(
      `🗑️ Attempting to soft delete product: ${productId} by admin: ${req.user._id}`,
    );

    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) {
      console.log(`❌ Product ${productId} not found`);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log(`✅ Found product: ${product.name}, deleting...`);

    // Instead of soft delete, let's actually delete the product
    // This ensures it's removed from the database
    await Product.findByIdAndDelete(productId);

    // Also remove from all users' carts
    try {
      await Cart.updateMany(
        { "cartItems.product": productId },
        { $pull: { cartItems: { product: productId } } },
      );
      console.log(`✅ Removed product from carts`);
    } catch (cartError) {
      console.error("Error removing from carts:", cartError);
    }

    console.log(
      `✅ Product ${productId} (${product.name}) deleted successfully`,
    );

    res.json({
      success: true,
      message: "Product has been deleted successfully",
      deletedProductId: productId,
      deletedProductName: product.name,
    });
  } catch (error) {
    console.error("❌ Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product: " + error.message,
    });
  }
};

// @desc    Permanently delete product (admin only)
// @route   DELETE /api/products/:id/permanent
// @access  Private/Admin
export const permanentDeleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if user exists in request
    if (!req.user) {
      console.log("❌ No user found in request");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Please login again",
      });
    }

    console.log(
      `🗑️ Attempting to permanently delete product: ${productId} by admin: ${req.user._id}`,
    );

    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) {
      console.log(`❌ Product ${productId} not found`);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log(
      `✅ Found product: ${product.name}, proceeding with permanent deletion...`,
    );

    // 1. Delete all comments related to this product
    try {
      await Comment.deleteMany({ product: productId });
      console.log(`✅ Deleted comments`);
    } catch (commentError) {
      console.error("Error deleting comments:", commentError);
    }

    // 2. Remove product from all users' carts
    try {
      await Cart.updateMany(
        { "cartItems.product": productId },
        { $pull: { cartItems: { product: productId } } },
      );
      console.log(`✅ Removed from carts`);
    } catch (cartError) {
      console.error("Error removing from carts:", cartError);
    }

    // 3. Handle orders - mark product as deleted
    try {
      const ordersWithProduct = await Order.find({
        "orderItems.product": productId,
      });

      for (const order of ordersWithProduct) {
        let orderModified = false;
        for (const item of order.orderItems) {
          if (item.product && item.product.toString() === productId) {
            item.name = `${item.name} (Product Deleted)`;
            item.product = null;
            orderModified = true;
          }
        }
        if (orderModified) {
          await order.save();
        }
      }
    } catch (orderError) {
      console.error("Error updating orders:", orderError);
    }

    // 4. Finally delete the product
    await Product.findByIdAndDelete(productId);

    console.log(`✅ Product ${productId} permanently deleted from database`);

    res.json({
      success: true,
      message: "Product permanently deleted from database",
      deletedProductId: productId,
    });
  } catch (error) {
    console.error("❌ Permanent delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to permanently delete product: " + error.message,
    });
  }
};

// @desc    Like/Unlike a product
// @route   POST /api/products/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const userId = req.user._id;
    const hasLiked = product.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      product.likes = product.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
      product.likeCount = Math.max(0, product.likeCount - 1);
    } else {
      // Like
      product.likes.push(userId);
      product.likeCount = product.likeCount + 1;
    }

    await product.save();

    res.json({
      liked: !hasLiked,
      likeCount: product.likeCount,
      productId: product._id,
    });
  } catch (error) {
    console.error("Error in toggleLike:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products created by specific user
// @route   GET /api/products/user/:userId
// @access  Private/Admin
export const getProductsByUser = async (req, res) => {
  try {
    const products = await Product.find({ user: req.params.userId })
      .populate("user", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Error in getProductsByUser:", error);
    res.status(500).json({ message: error.message });
  }
};
