import axios from "axios";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// @desc    Initialize Chapa Payment
// @route   POST /api/payments/chapa/initialize
// @access  Private
export const initializeChapaPayment = async (req, res) => {
  try {
    const { amount, email, firstName, lastName, tx_ref, items } = req.body;

    // Create order in database
    const order = await Order.create({
      user: req.user._id,
      orderItems: items.map((item) => ({
        product: item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      totalPrice: amount,
      paymentMethod: "chapa",
      paymentResult: { tx_ref, status: "pending" },
    });

    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency: "ETB",
        email,
        first_name: firstName,
        last_name: lastName,
        tx_ref,
        callback_url: "http://localhost:5000/api/payments/webhook",
        return_url: `http://localhost:5173/order-success/${order._id}`,
        customization: {
          title: "MyStore Payment",
          description: `Payment for order #${order._id}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.status === "success") {
      order.paymentResult.checkout_url = response.data.data.checkout_url;
      await order.save();

      // Clear cart after successful order creation
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { cartItems: [] } },
      );

      res.json({
        ...response.data,
        orderId: order._id,
      });
    } else {
      await order.deleteOne();
      res.status(400).json({ message: "Payment initialization failed" });
    }
  } catch (error) {
    console.error("Chapa Error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ message: error.response?.data?.message || error.message });
  }
};

// @desc    Initialize Telebirr Payment
// @route   POST /api/payments/telebirr/initialize
// @access  Private
export const initializeTelebirrPayment = async (req, res) => {
  try {
    const { amount, phone, items, tx_ref } = req.body;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems: items.map((item) => ({
        product: item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      totalPrice: amount,
      paymentMethod: "telebirr",
      paymentResult: { tx_ref, status: "pending" },
    });

    // Here you would integrate Telebirr API
    // For now, simulate successful response
    res.json({
      status: "success",
      message: "Telebirr payment initiated",
      orderId: order._id,
      checkout_url: `https://pay.telebirr.com/pay?orderId=${order._id}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Initialize CBE Birr Payment
// @route   POST /api/payments/cbebirr/initialize
// @access  Private
export const initializeCbeBirrPayment = async (req, res) => {
  try {
    const { amount, account, items, tx_ref } = req.body;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems: items.map((item) => ({
        product: item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      totalPrice: amount,
      paymentMethod: "cbebirr",
      paymentResult: { tx_ref, status: "pending" },
    });

    // Here you would integrate CBE Birr API
    res.json({
      status: "success",
      message: "CBE Birr payment initiated",
      orderId: order._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Payment
// @route   GET /api/payments/verify/:tx_ref
// @access  Public
export const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
      },
    );

    if (response.data.data.status === "success") {
      const order = await Order.findOne({ "paymentResult.tx_ref": tx_ref });
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult.status = "success";

        // Update product stock
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { countInStock: -item.quantity },
          });
        }

        await order.save();
      }
    }

    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Verification failed", error: error.message });
  }
};

// @desc    Webhook Handler
// @route   POST /api/payments/webhook
// @access  Public
export const chapaWebhook = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    if (status === "success") {
      const order = await Order.findOne({ "paymentResult.tx_ref": tx_ref });
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult.status = "success";

        // Update stock
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { countInStock: -item.quantity },
          });
        }

        await order.save();
      }
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook processing failed");
  }
};

// @desc    Get Payment Methods
// @route   GET /api/payments/methods
// @access  Public
export const getPaymentMethods = async (req, res) => {
  try {
    const methods = [
      {
        id: "chapa",
        name: "Chapa",
        icon: "💳",
        description: "Pay with Card, Telebirr, CBE Birr via Chapa",
        enabled: true,
      },
      {
        id: "telebirr",
        name: "Telebirr",
        icon: "📱",
        description: "Pay directly with Telebirr",
        enabled: true,
      },
      {
        id: "cbebirr",
        name: "CBE Birr",
        icon: "🏦",
        description: "Pay with CBE Birr account",
        enabled: true,
      },
    ];
    res.json({ methods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get User Orders
// @route   GET /api/payments/orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("orderItems.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Order by ID
// @route   GET /api/payments/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    // Check if user is authorized
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Orders (Admin only)
// @route   GET /api/payments/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("orderItems.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Order Status (Admin only)
// @route   PUT /api/payments/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    order.orderStatus = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
