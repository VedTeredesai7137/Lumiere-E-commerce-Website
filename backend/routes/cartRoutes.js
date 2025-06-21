/* eslint-env node */
const express = require('express');
const router = express.Router();

const {
  addToCart,
  getUserCart,
  removeFromCart,
  updateCartItemQuantity
} = require('../controllers/cartController.js');

const { validateCartItem } = require('../middleware/validate.js');

// Add to Cart
router.post("/", validateCartItem, addToCart);

// Get User's Cart
router.get("/:userId", getUserCart);

// Remove item from cart
router.delete("/:userId/:productId", removeFromCart);

// Update cart item quantity
router.patch("/:userId/:productId", updateCartItemQuantity);

module.exports = router; 