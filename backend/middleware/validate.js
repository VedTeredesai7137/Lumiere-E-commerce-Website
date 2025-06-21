const { listingSchema, reviewSchema, cartItemSchema, orderSchema } = require("../Schema");
const ExpressError = require("../utils/ExpressError");

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(msg, 400);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details.map(e => e.message).join(', ') });
  }
  next();
};

module.exports.validateCartItem = (req, res, next) => {
  const { error } = cartItemSchema.validate(req.body);
  if (error) {
    throw new ExpressError(error.details[0].message, 400);
  }
  next();
};

module.exports.validateOrder = (req, res, next) => {
  const { error } = orderSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(e => e.message).join(",");
    return res.status(400).json({ error: msg });
  }
  next();
};

