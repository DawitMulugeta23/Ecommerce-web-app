import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "cartItems.product",
      model: "Product",
      populate: {
        path: "user",
        select: "name email profilePicture",
      },
    });

    if (!cart) {
      return res.json({ cartItems: [] });
    }

    // Filter out deleted products and update quantities
    cart.cartItems = cart.cartItems.filter((item) => {
      if (!item.product) return false;
      if (item.quantity > item.product.countInStock) {
        item.quantity = item.product.countInStock;
      }
      return item.quantity > 0;
    });

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and get stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    // Check if quantity exceeds stock
    if (quantity > product.countInStock) {
      return res.status(400).json({
        message: `Only ${product.countInStock} items available in stock!`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      // Cart exists, update it
      const itemIndex = cart.cartItems.findIndex(
        (item) => item.product.toString() === productId,
      );

      if (itemIndex > -1) {
        // Check if new total quantity exceeds stock
        const newQuantity = cart.cartItems[itemIndex].quantity + quantity;
        if (newQuantity > product.countInStock) {
          return res.status(400).json({
            message: `Cannot add more than ${product.countInStock} items!`,
          });
        }
        cart.cartItems[itemIndex].quantity = newQuantity;
      } else {
        cart.cartItems.push({ product: productId, quantity });
      }
    } else {
      // Create new cart
      cart = await Cart.create({
        user: req.user._id,
        cartItems: [{ product: productId, quantity }],
      });
    }

    await cart.save();
    await cart.populate({
      path: "cartItems.product",
      populate: {
        path: "user",
        select: "name email profilePicture",
      },
    });

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.id;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found!" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not in cart!" });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.cartItems.splice(itemIndex, 1);
    } else {
      // Check if quantity exceeds stock
      if (quantity > product.countInStock) {
        return res.status(400).json({
          message: `Only ${product.countInStock} items available!`,
        });
      }
      cart.cartItems[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate({
      path: "cartItems.product",
      populate: {
        path: "user",
        select: "name email profilePicture",
      },
    });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found!" });
    }

    cart.cartItems = cart.cartItems.filter(
      (item) => item.product.toString() !== req.params.id,
    );

    await cart.save();
    await cart.populate({
      path: "cartItems.product",
      populate: {
        path: "user",
        select: "name email profilePicture",
      },
    });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync local cart with database
// @route   POST /api/cart/sync
// @access  Private
export const syncCart = async (req, res) => {
  try {
    const { localCart } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, cartItems: [] });
    }

    // Merge local cart with database cart
    for (const localItem of localCart) {
      const product = await Product.findById(localItem._id || localItem.id);
      if (!product || product.countInStock <= 0) continue;

      const existingItem = cart.cartItems.find(
        (item) => item.product.toString() === product._id.toString(),
      );

      if (existingItem) {
        // Take the larger quantity, but respect stock
        const newQuantity = Math.min(
          Math.max(existingItem.quantity, localItem.quantity),
          product.countInStock,
        );
        existingItem.quantity = newQuantity;
      } else {
        cart.cartItems.push({
          product: product._id,
          quantity: Math.min(localItem.quantity, product.countInStock),
        });
      }
    }

    await cart.save();
    await cart.populate({
      path: "cartItems.product",
      populate: {
        path: "user",
        select: "name email profilePicture",
      },
    });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
