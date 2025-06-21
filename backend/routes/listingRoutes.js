/* eslint-env node */
const express = require('express');
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });

const {
  createListing,
  getAllListings,
  getListingById,
  getListingsByCategory,
  updateListing,
  deleteListing
} = require('../controllers/listingController.js');

const { isAdmin } = require("../middleware/auth.js");
const { validateListing } = require("../middleware/validate.js");

// CREATE listing
router.post("/", upload.array('images', 3), createListing);

// READ all listings
router.get("/", getAllListings);

// READ single listing by ID (more specific route first)
router.get("/id/:id", getListingById);

// READ listings by category (less specific route after)
router.get("/:category", getListingsByCategory);

// UPDATE listing
router.put("/:id", isAdmin, validateListing, updateListing);

// DELETE listing
router.delete("/:id", isAdmin, deleteListing);

module.exports = router; 