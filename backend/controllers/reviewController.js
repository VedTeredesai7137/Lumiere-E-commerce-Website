/* eslint-env node */
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapasync.js");

// GET reviews for a listing
const getReviewsByListing = wrapAsync(async (req, res) => {
  const { listingId } = req.params;
  const reviews = await Review.find({ listingId });
  res.json(reviews);
});

// POST new review
const createReview = wrapAsync(async (req, res) => {
  const { listingId, userId, username, rating, comment } = req.body;
  const existing = await Review.findOne({ listingId, userId });
  if (existing) {
    return res.status(400).json({ error: 'User has already submitted a review for this listing.' });
  }
  const newReview = new Review({ listingId, userId, username, rating, comment });
  await newReview.save();
  res.status(201).json(newReview);
});

// Middleware to check if user owns the review
const requireReviewOwner = async (req, res, next) => {
  const { reviewId } = req.params;
  const userId = req.session.user?._id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const review = await Review.findById(reviewId);
  if (!review) return res.status(404).json({ error: 'Review not found' });
  if (review.userId.toString() !== userId.toString()) {
    return res.status(403).json({ error: 'You are not authorized to modify this review.' });
  }
  req.review = review;
  next();
};

// PUT edit review (user can only edit their own review)
const updateReview = wrapAsync(async (req, res) => {
  const { reviewId } = req.params;
  const updated = await Review.findByIdAndUpdate(reviewId, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: 'Review not found' });
  res.json(updated);
});

// DELETE review (user can only delete their own review)
const deleteReview = wrapAsync(async (req, res) => {
  await Review.findByIdAndDelete(req.params.reviewId);
  res.json({ message: 'Review deleted successfully' });
});

// GET average rating for a listing
const getAverageRating = wrapAsync(async (req, res) => {
  const { listingId } = req.params;
  const mongoose = require('mongoose');
  const result = await Review.aggregate([
    { $match: { listingId: new mongoose.Types.ObjectId(listingId) } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } }
  ]);
  res.json({ averageRating: result[0]?.avgRating || 0 });
});

module.exports = {
  getReviewsByListing,
  createReview,
  requireReviewOwner,
  updateReview,
  deleteReview,
  getAverageRating
}; 