/* eslint-env node */
const Cart = require("../models/cart.js");
const Listing = require("../models/listing.js");
const EcommCustomerModel = require("../models/EcommCustomer.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapasync.js");

// Add to Cart
const addToCart = wrapAsync(async (req, res) => {
  const { userId, productId, quantity } = req.body;

  // Check if product exists
  const product = await Listing.findById(productId);
  if (!product) {
    throw new ExpressError("Product not found", 404);
  }

  // Check if user exists
  const user = await EcommCustomerModel.findById(userId);
  if (!user) {
    throw new ExpressError("User not found", 404);
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [{ product: productId, quantity }] });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
  }

  await cart.save();
  
  // Populate product details before sending response
  await cart.populate("items.product");
  res.json(cart);
});

// Get User's Cart
const getUserCart = wrapAsync(async (req, res) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await EcommCustomerModel.findById(userId);
  if (!user) {
    throw new ExpressError("User not found", 404);
  }

  const cart = await Cart.findOne({ userId }).populate("items.product");
  res.json(cart || { items: [] });
});

// Remove item from cart
const removeFromCart = wrapAsync(async (req, res) => {
  const { userId, productId } = req.params;

  // Check if user exists
  const user = await EcommCustomerModel.findById(userId);
  if (!user) {
    throw new ExpressError("User not found", 404);
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ExpressError("Cart not found", 404);
  }

  // Remove the item
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  
  // Populate product details before sending response
  await cart.populate("items.product");
  res.json(cart);
});

// Update cart item quantity
const updateCartItemQuantity = wrapAsync(async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  // Validate quantity
  if (!quantity || quantity < 1) {
    throw new ExpressError("Invalid quantity", 400);
  }

  // Check if user exists
  const user = await EcommCustomerModel.findById(userId);
  if (!user) {
    throw new ExpressError("User not found", 404);
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ExpressError("Cart not found", 404);
  }

  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );
  if (!item) {
    throw new ExpressError("Item not found in cart", 404);
  }

  item.quantity = quantity;
  await cart.save();
  
  // Populate product details before sending response
  await cart.populate("items.product");
  res.json(cart);
});

module.exports = {
  addToCart,
  getUserCart,
  removeFromCart,
  updateCartItemQuantity
}; 