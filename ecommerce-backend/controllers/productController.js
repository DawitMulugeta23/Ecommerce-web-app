// backend/controllers/productController.js
import Cart from "../models/Cart.js";
import Comment from "../models/Comment.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("user", "name email profilePicture")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "user",
      "name email profilePicture",
    );

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found!" });
    }
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

// @desc    Delete product completely from database
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete all comments related to this product
    await Comment.deleteMany({ product: req.params.id });

    // Remove product from all carts
    await Cart.updateMany(
      { "cartItems.product": req.params.id },
      { $pull: { cartItems: { product: req.params.id } } },
    );

    // Remove product from orders (but keep orders, just mark product as deleted)
    await Order.updateMany(
      { "orderItems.product": req.params.id },
      { $set: { "orderItems.$[elem].name": "[Deleted Product]" } },
      { arrayFilters: [{ "elem.product": req.params.id }] },
    );

    // Finally delete the product
    await product.deleteOne();

    console.log(
      `Product ${req.params.id} deleted completely from database by admin ${req.user._id}`,
    );

    res.json({
      success: true,
      message: "Product deleted successfully from database",
      deletedProductId: req.params.id,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: error.message });
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
