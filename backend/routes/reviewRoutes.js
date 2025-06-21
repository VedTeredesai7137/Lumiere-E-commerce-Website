/* eslint-env node */
const express = require('express');
const router = express.Router();

const {
  getReviewsByListing,
  createReview,
  requireReviewOwner,
  updateReview,
  deleteReview,
  getAverageRating
} = require('../controllers/reviewController.js');

const { validateReview } = require('../middleware/validate.js');

// GET average rating for a listing (more specific route first)
router.get('/average/:listingId', getAverageRating);

// GET reviews for a listing (less specific route after)
router.get('/:listingId', getReviewsByListing);

// POST new review
router.post('/', validateReview, createReview);

// PUT edit review (user can only edit their own review)
router.put('/:reviewId', requireReviewOwner, validateReview, updateReview);

// DELETE review (user can only delete their own review)
router.delete('/:reviewId', requireReviewOwner, deleteReview);

module.exports = router; 