// controllers/paymentController.js
import axios from "axios";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// @desc    Initialize Chapa Payment
// @route   POST /api/payments/chapa/initialize
// @access  Private
export const initializeChapaPayment = async (req, res) => {
  try {
    const {
      amount,
      email,
      firstName,
      lastName,
      phone,
      address,
      city,
      tx_ref,
      items,
      payment_method,
      payment_data,
    } = req.body;

    // Create order in database with customer info
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
      paymentResult: {
        tx_ref,
        status: "pending",
        method: payment_method,
        customer: {
          email,
          phone,
          address,
          city,
        },
      },
      shippingAddress: {
        address,
        city,
        phone,
      },
    });

    // Prepare metadata for Chapa
    const metadata = {
      order_id: order._id.toString(),
      customer_name: `${firstName} ${lastName}`,
      customer_phone: phone,
      payment_method: payment_method,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

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
        meta: metadata,
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

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    // Check if order is paid - prevent deletion of paid orders
    if (order.isPaid) {
      return res.status(400).json({
        message:
          "Cannot delete paid orders. Paid orders must be kept for record keeping.",
      });
    }

    // Store order info before deletion for response
    const orderInfo = {
      id: order._id,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
    };

    // Permanently delete the order from database
    await Order.findByIdAndDelete(req.params.id);

    console.log(`Order ${req.params.id} deleted successfully by admin`);

    res.json({
      success: true,
      message: "Order deleted successfully",
      deletedOrderId: order._id,
      order: orderInfo,
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel Order (User or Admin) - Just updates status to cancelled
// @route   PUT /api/payments/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    // Check if user is authorized (order owner or admin)
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    // Check if order can be cancelled
    if (
      order.orderStatus === "delivered" ||
      order.orderStatus === "cancelled"
    ) {
      return res.status(400).json({
        message: `Order cannot be cancelled as it is already ${order.orderStatus}`,
      });
    }

    if (order.isPaid) {
      return res.status(400).json({
        message: "Paid orders cannot be cancelled. Please contact support.",
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Rest of your existing functions remain the same...
export const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    // Check if order exists with this tx_ref
    const order = await Order.findOne({ "paymentResult.tx_ref": tx_ref });

    if (order) {
      return res.json({
        status: "success",
        data: {
          status: order.isPaid ? "success" : "pending",
          orderId: order._id,
        },
      });
    }

    // If not found in our DB, verify with Chapa
    try {
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
    } catch (chapaError) {
      res.status(400).json({
        status: "error",
        message: "Transaction not found or verification failed",
      });
    }
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

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    order.orderStatus = status;
    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: error.message });
  }
};
