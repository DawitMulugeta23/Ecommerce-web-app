import Cart from '../models/Cart.js';

// @desc    Add or Update item in cart
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  try {
    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);
      
      if (itemIndex > -1) {
        // ምርቱ ካለ መጠኑን መጨመር
        cart.cartItems[itemIndex].quantity += (quantity || 1);
      } else {
        // አዲስ ምርት መጨመር
        cart.cartItems.push({ product: productId, quantity: quantity || 1 });
      }
      await cart.save();
    } else {
      // አዲስ ካርት መፍጠር
      cart = await Cart.create({
        user: userId,
        cartItems: [{ product: productId, quantity: quantity || 1 }]
      });
    }

    const updatedCart = await Cart.findOne({ user: userId }).populate('cartItems.product');
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product');
    res.status(200).json(cart || { cartItems: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};