import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    console.log("Fetching cart for user:", req.user._id);

    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "cartItems.product",
      model: "Product",
      select: "name price image countInStock description category",
    });

    if (!cart) {
      console.log("No cart found, returning empty cart");
      return res.json({
        cartItems: [],
        user: req.user._id,
      });
    }

    // Filter out deleted products and update quantities
    const validItems = [];
    for (const item of cart.cartItems) {
      if (!item.product) {
        console.log("Skipping item with no product");
        continue;
      }

      // Check if product still exists and has stock
      const product = await Product.findById(item.product._id);
      if (!product) {
        console.log("Product not found, removing from cart:", item.product._id);
        continue;
      }

      // Adjust quantity if stock decreased
      if (item.quantity > product.countInStock) {
        if (product.countInStock > 0) {
          console.log(
            `Adjusting quantity from ${item.quantity} to ${product.countInStock} for product ${product.name}`,
          );
          item.quantity = product.countInStock;
        } else {
          console.log(
            `Product ${product.name} out of stock, removing from cart`,
          );
          continue;
        }
      }

      validItems.push(item);
    }

    cart.cartItems = validItems;
    await cart.save();

    console.log("Cart fetched successfully with", validItems.length, "items");
    res.json(cart);
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    console.log(
      `Adding to cart - User: ${userId}, Product: ${productId}, Quantity: ${quantity}`,
    );

    // Check if product exists and get stock
    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product not found:", productId);
      return res.status(404).json({ message: "Product not found!" });
    }

    console.log("Product found:", product.name, "Stock:", product.countInStock);

    // Check if quantity exceeds stock
    if (quantity > product.countInStock) {
      console.log(`Quantity ${quantity} exceeds stock ${product.countInStock}`);
      return res.status(400).json({
        message: `Only ${product.countInStock} items available in stock!`,
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      console.log("No cart found, creating new cart");
      cart = new Cart({
        user: userId,
        cartItems: [],
      });
    }

    // Check if product already in cart
    const existingItemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (existingItemIndex > -1) {
      // Update existing item
      const newQuantity = cart.cartItems[existingItemIndex].quantity + quantity;
      console.log(
        `Product already in cart, current quantity: ${cart.cartItems[existingItemIndex].quantity}, new quantity: ${newQuantity}`,
      );

      if (newQuantity > product.countInStock) {
        console.log(
          `New quantity ${newQuantity} exceeds stock ${product.countInStock}`,
        );
        return res.status(400).json({
          message: `Cannot add more than ${product.countInStock} items!`,
        });
      }

      cart.cartItems[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      console.log("Adding new product to cart");
      cart.cartItems.push({
        product: productId,
        quantity: quantity,
      });
    }

    // Save cart
    await cart.save();
    console.log("Cart saved successfully");

    // Populate and return updated cart
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "cartItems.product",
      model: "Product",
      select: "name price image countInStock description category",
    });

    console.log("Cart populated with", populatedCart.cartItems.length, "items");
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error("Error in addToCart:", error);
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
    const userId = req.user._id;

    console.log(
      `Updating cart item - User: ${userId}, Product: ${productId}, New Quantity: ${quantity}`,
    );

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      console.log("Cart not found");
      return res.status(404).json({ message: "Cart not found!" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product not found:", productId);
      return res.status(404).json({ message: "Product not found!" });
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex === -1) {
      console.log("Item not in cart");
      return res.status(404).json({ message: "Item not in cart!" });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      console.log("Removing item from cart");
      cart.cartItems.splice(itemIndex, 1);
    } else {
      // Check if quantity exceeds stock
      if (quantity > product.countInStock) {
        console.log(
          `Quantity ${quantity} exceeds stock ${product.countInStock}`,
        );
        return res.status(400).json({
          message: `Only ${product.countInStock} items available!`,
        });
      }
      cart.cartItems[itemIndex].quantity = quantity;
      console.log(`Updated quantity to ${quantity}`);
    }

    await cart.save();
    console.log("Cart saved after update");

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "cartItems.product",
      model: "Product",
      select: "name price image countInStock description category",
    });

    res.json(populatedCart);
  } catch (error) {
    console.error("Error in updateCartItem:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    console.log(`Removing from cart - User: ${userId}, Product: ${productId}`);

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      console.log("Cart not found");
      return res.status(404).json({ message: "Cart not found!" });
    }

    const initialLength = cart.cartItems.length;
    cart.cartItems = cart.cartItems.filter(
      (item) => item.product.toString() !== productId,
    );

    if (cart.cartItems.length === initialLength) {
      console.log("Item not found in cart");
      return res.status(404).json({ message: "Item not in cart!" });
    }

    await cart.save();
    console.log("Item removed, cart saved");

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "cartItems.product",
      model: "Product",
      select: "name price image countInStock description category",
    });

    res.json(populatedCart);
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync local cart with database
// @route   POST /api/cart/sync
// @access  Private
export const syncCart = async (req, res) => {
  try {
    const { localCart } = req.body;
    const userId = req.user._id;

    console.log(
      `Syncing cart for user: ${userId} with ${localCart?.length || 0} local items`,
    );

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      console.log("No existing cart, creating new");
      cart = new Cart({ user: userId, cartItems: [] });
    }

    // Process local cart items
    if (localCart && localCart.length > 0) {
      for (const localItem of localCart) {
        const product = await Product.findById(localItem._id || localItem.id);
        if (!product || product.countInStock <= 0) {
          console.log(
            `Skipping product ${localItem._id || localItem.id} - not available`,
          );
          continue;
        }

        const existingItemIndex = cart.cartItems.findIndex(
          (item) => item.product.toString() === product._id.toString(),
        );

        const quantity = Math.min(
          localItem.quantity || 1,
          product.countInStock,
        );

        if (existingItemIndex > -1) {
          // Take the larger quantity, but respect stock
          const newQuantity = Math.min(
            Math.max(cart.cartItems[existingItemIndex].quantity, quantity),
            product.countInStock,
          );
          cart.cartItems[existingItemIndex].quantity = newQuantity;
          console.log(`Updated existing item quantity to ${newQuantity}`);
        } else {
          cart.cartItems.push({
            product: product._id,
            quantity: quantity,
          });
          console.log(`Added new item with quantity ${quantity}`);
        }
      }
    }

    await cart.save();
    console.log("Cart synced and saved");

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "cartItems.product",
      model: "Product",
      select: "name price image countInStock description category",
    });

    res.json(populatedCart);
  } catch (error) {
    console.error("Error in syncCart:", error);
    res.status(500).json({ message: error.message });
  }
};
