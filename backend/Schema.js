const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    category: Joi.string().valid("ring", "necklace", "earrings", "bracelet").required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().allow(''),
    metalType: Joi.string().valid('gold', 'silver', 'platinum', 'rose_gold', 'white_gold', 'palladium').required(),
    metalPurity: Joi.string().valid('10k', '14k', '18k', '22k', '24k', '925', '950', '999').required(),
    gemstones: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('diamond', 'ruby', 'sapphire', 'emerald', 'amethyst', 'pearl', 'other')
      })
    ).default([]).optional()
  }).required()
});


module.exports.reviewSchema = Joi.object({
  listingId: Joi.string().required(),
  userId: Joi.string().required(),
  username: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required()
});
module.exports.orderSchema = Joi.object({
  userId: Joi.string().required(),
  products: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required()
    })
  ).min(1).required(),
  totalAmount: Joi.number().min(0).required(),
  shippingInfo: Joi.object({
    fullName: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().allow(''),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().default("India"),
    notes: Joi.string().allow('')
  }).required()

});
