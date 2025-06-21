/* eslint-env node */
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../Schema.js");
const wrapAsync = require("../utils/wrapasync.js");

// CREATE listing
const createListing = wrapAsync(async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received files:', req.files);
    console.log('Content-Type:', req.get('Content-Type'));
    
    // Handle both JSON and FormData
    let listingData;
    
    if (req.body.listing) {
      // Check if listing is a JSON string (from FormData) or an object (from JSON)
      if (typeof req.body.listing === 'string') {
        try {
          listingData = JSON.parse(req.body.listing);
        } catch (parseError) {
          console.error('Error parsing listing JSON:', parseError);
          throw new ExpressError('Invalid listing data format', 400);
        }
      } else {
        // It's already an object
        listingData = req.body.listing;
      }
      
      // Parse gemstones if it's a string
      if (typeof listingData.gemstones === 'string') {
        try {
          listingData.gemstones = JSON.parse(listingData.gemstones);
        } catch (parseError) {
          console.error('Error parsing gemstones from JSON:', parseError);
          listingData.gemstones = [];
        }
      }
      
      // Ensure gemstones is an array
      if (!Array.isArray(listingData.gemstones)) {
        listingData.gemstones = [];
      }
    } else {
      // FormData format - parse the form data
      listingData = {
        title: req.body['listing[title]'],
        category: req.body['listing[category]'],
        price: Number(req.body['listing[price]']),
        description: req.body['listing[description]'] || '',
        metalType: req.body['listing[metalType]'],
        metalPurity: req.body['listing[metalPurity]'],
        gemstones: []
      };

      // Parse gemstones safely
      if (req.body['listing[gemstones]']) {
        try {
          const parsedGemstones = JSON.parse(req.body['listing[gemstones]']);
          if (Array.isArray(parsedGemstones)) {
            listingData.gemstones = parsedGemstones;
          }
        } catch (parseError) {
          console.error('Error parsing gemstones:', parseError);
          listingData.gemstones = [];
        }
      }
    }

    console.log('Processed listingData:', listingData);

    // Validate the listing data
    const { error } = listingSchema.validate({ listing: listingData });
    if (error) {
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
    }

    const listing = new Listing(listingData);
    
    // Add images if uploaded
    if (req.files && req.files.length > 0) {
      console.log('Processing uploaded files:', req.files);
      
      listing.images = req.files.map((file, index) => {
        console.log(`File ${index}:`, {
          originalname: file.originalname,
          filename: file.filename,
          path: file.path,
          url: file.url,
          secure_url: file.secure_url
        });
        
        // Use the best available URL from Cloudinary
        const imageUrl = file.secure_url || file.url || file.path;
        
        if (!imageUrl) {
          console.error('No valid URL found for file:', file);
          throw new ExpressError(`Failed to upload image ${index + 1}`, 500);
        }
        
        return {
          url: imageUrl,
          filename: file.filename || file.originalname
        };
      });
    }
    
    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// READ all listings
const getAllListings = wrapAsync(async (req, res) => {
  const listings = await Listing.find({});
  res.json(listings);
});

// READ single listing by ID
const getListingById = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError("Listing not found", 404);
  }
  res.json(listing);
});

// READ listings by category
const getListingsByCategory = wrapAsync(async (req, res) => {
  const { category } = req.params;
  // Only allow specific categories
  const validCategories = ["rings", "necklaces", "earrings", "bracelets"];
  if (!validCategories.includes(category)) {
    throw new ExpressError("Category not found", 404);
  }
  const listings = await Listing.find({ category });
  res.json(listings);
});

// UPDATE listing
const updateListing = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
  if (!updated) throw new ExpressError("Listing not found", 404);
  res.json(updated);
});

// DELETE listing
const deleteListing = wrapAsync(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.json({ message: "Listing deleted" });
});

module.exports = {
  createListing,
  getAllListings,
  getListingById,
  getListingsByCategory,
  updateListing,
  deleteListing
}; 