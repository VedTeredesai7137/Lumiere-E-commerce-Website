const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  images: [
    {
      url: String,
      filename: String
    }
  ],
  category: {
    type: String,
    enum: ["ring", "necklace", "earrings", "bracelet"],
    required: true
  },
  price: { type: Number, required: true, min: 0 },
  description: { type: String },
  metalType: {
    type: String,
    required: true,
    enum: ['gold', 'silver', 'platinum', 'rose_gold', 'white_gold', 'palladium']
  },
  metalPurity: {
    type: String,
    enum: ['10k', '14k', '18k', '22k', '24k', '925', '950', '999']
  },
  gemstones: [
    {
      type: {
        type: String,
        enum: ['diamond', 'ruby', 'sapphire', 'emerald', 'amethyst', 'pearl', 'other']
      }
    }
  ]
});

module.exports = mongoose.model('Listing', listingSchema);
