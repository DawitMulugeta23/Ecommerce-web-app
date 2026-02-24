import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  try {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "ምርቱ አልተገኘም!" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      // Cart exists, update it
      const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);
      
      if (itemIndex > -1) {
        // Product exists in cart, update quantity
        cart.cartItems[itemIndex].quantity += quantity || 1;
      } else {
        // Product not in cart, add it
        cart.cartItems.push({ product: productId, quantity: quantity || 1 });
      }
      
      cart = await cart.save();
    } else {
      // Create new cart
      cart = await Cart.create({
        user: userId,
        cartItems: [{ product: productId, quantity: quantity || 1 }]
      });
    }

    // Populate product details
    await cart.populate('cartItems.product');
    
    res.status(200).json(cart);
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('cartItems.product');
    
    if (!cart) {
      return res.status(200).json({ cartItems: [], user: req.user._id });
    }
    
    res.status(200).json(cart);
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
      return res.status(404).json({ message: "ካርት አልተገኘም!" });
    }
    
    cart.cartItems = cart.cartItems.filter(
      item => item.product.toString() !== req.params.id
    );
    
    await cart.save();
    await cart.populate('cartItems.product');
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: "ካርት አልተገኘም!" });
    }
    
    const itemIndex = cart.cartItems.findIndex(
      item => item.product.toString() === req.params.id
    );
    
    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.cartItems.splice(itemIndex, 1);
      } else {
        cart.cartItems[itemIndex].quantity = quantity;
      }
      
      await cart.save();
      await cart.populate('cartItems.product');
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "ምርቱ በካርት ውስጥ አልተገኘም!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};