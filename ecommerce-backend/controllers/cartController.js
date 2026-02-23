import Cart from '../models/Cart.js';

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  try {
    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      // ካርቱ ካለና ምርቱ ቀድሞ ካለ ብዛቱን መጨመር
      const itemIndex = cart.cartItems.findIndex(p => p.product == productId);
      if (itemIndex > -1) {
        cart.cartItems[itemIndex].quantity += quantity;
      } else {
        cart.cartItems.push({ product: productId, quantity });
      }
      cart = await cart.save();
    } else {
      // አዲስ ካርት መፍጠር
      cart = await Cart.create({
        user: userId,
        cartItems: [{ product: productId, quantity }]
      });
    }
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};