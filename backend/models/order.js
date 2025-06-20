const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "EcommCustomer", required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
      quantity: { type: Number, required: true, min: 1 }
    }
  ],
  totalAmount: { type: Number, required: true },
  shippingInfo: {
    fullName: String,
    phone: String,
    email: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    notes: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Order Placed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
