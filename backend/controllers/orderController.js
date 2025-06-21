/* eslint-env node */
const Order = require("../models/order.js");
const Cart = require("../models/cart.js");
const wrapAsync = require("../utils/wrapasync.js");

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId })
      .populate("products.productId", "title price image");
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Error fetching orders" });
  }
};

// Create new order
const createOrder = async (req, res) => {
  try {
    const newOrder = new Order({
      ...req.body,
      status: "Pending"  
    });
    await newOrder.save();

    // Clear user's cart after successful order
    await Cart.findOneAndUpdate(
      { userId: req.body.userId },
      { $set: { items: [] } }
    );

    res.status(201).json(newOrder);
  } catch {
    res.status(500).json({ error: "Error creating order" });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Allowed statuses from the model
  const validStatuses = ["Pending", "Order Placed", "Shipped", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status update." });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();
    res.json({ message: "Order status updated", order });
  } catch {
    res.status(500).json({ error: "Error updating status" });
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "name email")
      .populate("products.productId", "title price image");
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

module.exports = {
  getUserOrders,
  createOrder,
  updateOrderStatus,
  getAllOrders
}; 