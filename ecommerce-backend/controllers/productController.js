// backend/controllers/productController.js
import mongoose from "mongoose";
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
    const isAdmin = req.user && req.user.role === 'admin';
    
    // If not admin, filter out products with zero stock
    if (!isAdmin) {
      products = products.filter(product => product.countInStock > 0);
    }
    
    res.json(products);
  } catch (error) {
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
    const isAdmin = req.user && req.user.role === 'admin';
    
    // If product has zero stock and user is not admin, hide it
    if (product.countInStock === 0 && !isAdmin) {
      return res.status(404).json({ message: "Product not available!" });
    }

    res.json(product);
  } catch (error) {
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product (soft delete - just set stock to 0)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const productId = req.params.id;
    console.log(`🗑️ Attempting to soft delete product: ${productId} by admin: ${req.user._id}`);

    // Check if product exists
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      console.log(`❌ Product ${productId} not found`);
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    console.log(`✅ Found product: ${product.name}, setting stock to 0...`);

    // Instead of deleting, just set stock to 0
    product.countInStock = 0;
    await product.save({ session });
    
    // Also remove from all users' carts
    const cartUpdateResult = await Cart.updateMany(
      { "cartItems.product": productId },
      { $pull: { cartItems: { product: productId } } }
    ).session(session);
    console.log(`✅ Removed product from ${cartUpdateResult.modifiedCount} carts`);

    await session.commitTransaction();
    session.endSession();
    
    console.log(`✅ Product ${productId} (${product.name}) soft deleted successfully (stock set to 0)`);

    res.json({ 
      success: true,
      message: "Product has been removed from store (stock set to 0)",
      deletedProductId: productId,
      deletedProductName: product.name
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("❌ Soft delete product error details:", {
      error: error.message,
      stack: error.stack,
      productId: req.params.id
    });
    
    res.status(500).json({ 
      success: false,
      message: "Failed to remove product: " + error.message 
    });
  }
};

// @desc    Permanently delete product (admin only)
// @route   DELETE /api/products/:id/permanent
// @access  Private/Admin
export const permanentDeleteProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const productId = req.params.id;
    console.log(`🗑️ Attempting to permanently delete product: ${productId} by admin: ${req.user._id}`);

    // Check if product exists
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      console.log(`❌ Product ${productId} not found`);
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    console.log(`✅ Found product: ${product.name}, proceeding with permanent deletion...`);

    // 1. Delete all comments related to this product
    const commentDeleteResult = await Comment.deleteMany({ product: productId }).session(session);
    console.log(`✅ Deleted ${commentDeleteResult.deletedCount} comments`);

    // 2. Remove product from all users' carts
    const cartUpdateResult = await Cart.updateMany(
      { "cartItems.product": productId },
      { $pull: { cartItems: { product: productId } } }
    ).session(session);
    console.log(`✅ Removed from ${cartUpdateResult.modifiedCount} carts`);

    // 3. Handle orders - mark product as deleted
    const ordersWithProduct = await Order.find({
      "orderItems.product": productId
    }).session(session);

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
        await order.save({ session });
      }
    }

    // 4. Finally delete the product
    await Product.findByIdAndDelete(productId).session(session);
    
    await session.commitTransaction();
    session.endSession();
    
    console.log(`✅ Product ${productId} permanently deleted from database`);

    res.json({ 
      success: true,
      message: "Product permanently deleted from database",
      deletedProductId: productId
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("❌ Permanent delete error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to permanently delete product: " + error.message 
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
    res.status(500).json({ message: error.message });
  }
};