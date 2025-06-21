/* eslint-env node */
const express = require('express');
const router = express.Router();

const {
  getUserOrders,
  createOrder,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController.js');

const { validateOrder } = require('../middleware/validate.js');
const { isAdmin } = require('../middleware/auth.js');

// Get all orders (admin only) - more specific route first
router.get("/admin/orders", isAdmin, getAllOrders);

// Get user's orders - less specific route after
router.get("/user/:userId", getUserOrders);

// Create new order
router.post("/", validateOrder, createOrder);

// Update order status (admin only)
router.put("/:id/status", isAdmin, updateOrderStatus);

module.exports = router; 