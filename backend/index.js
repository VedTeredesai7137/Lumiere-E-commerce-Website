/* eslint-env node */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Joi = require("joi");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const path = require('path');

const EcommCustomerModel = require("./models/EcommCustomer.js");
const adminModel = require("./models/admin.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const wrapAsync = require("./utils/wrapasync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema, orderSchema } = require("./Schema.js");
const Cart = require("./models/cart.js");
const Order = require("./models/order.js");
const { isAdmin } = require("./middleware/auth.js");
const multer = require("multer");
const { storage } = require("./cloudconfig.js");
const upload = multer({ storage });

const app = express();

// Log important environment variables
console.log("Session secret:", process.env.SECRET ? "Set" : "Not set");
console.log("MongoDB URL:", process.env.ATLASDB_URL ? "Set" : "Not set");
console.log("Node environment:", process.env.NODE_ENV);

const dbUrl = process.env.ATLASDB_URL;

mongoose.connect(dbUrl)
  .then(() => console.log("MongoDB Atlas Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Session store setup
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
};

// Middleware setup
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session(sessionOptions));

// Middleware to validate listings
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await EcommCustomerModel.findOne({ email: email });
    
    if (!user) {
      return res.json({ status: "error", error: "User Not Found" });
    }

    if (user.password !== password) {
      return res.json({ status: "error", error: "Invalid Password" });
    }

    // Set user data in session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email
    };

    // Send complete user data
    res.json({
      status: "ok",
      result: {
        _id: user._id,
        username: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.json({ status: "error", error: "Server error" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await EcommCustomerModel.findOne({ email });
    if (existingUser) {
      return res.json({ error: "Email already registered" });
    }

    // Create new user
    const newUser = new EcommCustomerModel({
      name,
      email,
      password
    });

    await newUser.save();
    console.log("New user registered:", newUser);

    res.json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.json({ error: "Registration failed. Please try again." });
  }
});

app.post("/adminlogin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await adminModel.findOne({ username });
    
    if (!admin) {
      return res.json({ status: "error", error: "Admin not found" });
    }
    
    if (admin.password !== password) {
      return res.json({ status: "error", error: "Invalid password" });
    }

    // Set admin data in session
    req.session.user = {
      _id: admin._id,
      username: admin.username,
      role: "admin"
    };

    res.json({ status: "ok", admin });
  } catch (err) {
    console.error("Admin login error:", err);
    res.json({ status: "error", error: "Server error" });
  }
});

// Logout endpoint
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.json({ status: "error", error: "Error logging out" });
    }
    res.clearCookie("connect.sid");
    res.json({ status: "ok" });
  });
});

// Check session status endpoint
app.get("/check-auth", (req, res) => {
  if (req.session.user) {
    res.json({
      status: "ok",
      user: req.session.user
    });
  } else {
    res.json({ status: "error", message: "Not authenticated" });
  }
});

// CREATE listing
app.post("/listings", upload.array('images', 3), wrapAsync(async (req, res) => {
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
}));

// READ all listings
app.get("/listings", wrapAsync(async (req, res) => {
  const listings = await Listing.find({});
  res.json(listings);
}));

// READ single listing by ID
app.get("/listings/id/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError("Listing not found", 404);
  }
  res.json(listing);
}));

// READ listings by category (e.g., /listings/rings)
app.get("/listings/:category", wrapAsync(async (req, res) => {
  const { category } = req.params;
  // Only allow specific categories
  const validCategories = ["rings", "necklaces", "earrings", "bracelets"];
  if (!validCategories.includes(category)) {
    throw new ExpressError("Category not found", 404);
  }
  const listings = await Listing.find({ category });
  res.json(listings);
}));

// UPDATE listing
app.put("/listings/:id", isAdmin, validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
  if (!updated) throw new ExpressError("Listing not found", 404);
  res.json(updated);
}));

// DELETE listing
app.delete("/listings/:id", isAdmin, wrapAsync(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.json({ message: "Listing deleted" });
}));

// Cart Schema validation
const cartItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required()
});

// Add to Cart
app.post("/cart", wrapAsync(async (req, res) => {
  const { userId, productId, quantity } = req.body;

  // Validate request
  const { error } = cartItemSchema.validate({ productId, quantity });
  if (error) {
    throw new ExpressError(error.details[0].message, 400);
  }

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
}));

// Get User's Cart
app.get("/cart/:userId", wrapAsync(async (req, res) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await EcommCustomerModel.findById(userId);
  if (!user) {
    throw new ExpressError("User not found", 404);
  }

  const cart = await Cart.findOne({ userId }).populate("items.product");
  res.json(cart || { items: [] });
}));

// Remove item from cart
app.delete("/cart/:userId/:productId", wrapAsync(async (req, res) => {
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
}));

// Update cart item quantity
app.patch("/cart/:userId/:productId", wrapAsync(async (req, res) => {
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
}));

// Error handler for other errors
app.use((err, req, res) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).json({ error: message });
});

const validateOrder = (req, res, next) => {
  const { error } = orderSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(e => e.message).join(",");
    return res.status(400).json({ error: msg });
  }
  next();
};

app.get("/orders/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId })
      .populate("products.productId", "title price image");
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Error fetching orders" });
  }
});

app.post("/orders", validateOrder, async (req, res) => {
  try {
    const newOrder = new Order({
      ...req.body,
      status: "Pending"  
    });
    await newOrder.save();

    // Clear user's cart after successful order
    await Cart.findOneAndUpdate(
      { userId: req.body.userId },
      { $set: { items: [] } }
    );

    res.status(201).json(newOrder);
  } catch {
    res.status(500).json({ error: "Error creating order" });
  }
});

app.put("/orders/:id/status", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Allowed statuses from the model
  const validStatuses = ["Pending", "Order Placed", "Shipped", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status update." });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();
    res.json({ message: "Order status updated", order });
  } catch {
    res.status(500).json({ error: "Error updating status" });
  }
});

app.get("/admin/orders", isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "name email")
      .populate("products.productId", "title price image");
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.use(express.static("public"));
// app.use('/uploads', express.static('uploads')); // No longer needed with Cloudinary

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details.map(e => e.message).join(', ') });
  }
  next();
};

// GET reviews for a listing
app.get('/reviews/:listingId', wrapAsync(async (req, res) => {
  const { listingId } = req.params;
  const reviews = await Review.find({ listingId });
  res.json(reviews);
}));

app.post('/reviews', validateReview, wrapAsync(async (req, res) => {
  const { listingId, userId, username, rating, comment } = req.body;
  const existing = await Review.findOne({ listingId, userId });
  if (existing) {
    return res.status(400).json({ error: 'User has already submitted a review for this listing.' });
  }
  const newReview = new Review({ listingId, userId, username, rating, comment });
  await newReview.save();
  res.status(201).json(newReview);
}));

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

// Edit review (user can only edit their own review)
app.put('/reviews/:reviewId', requireReviewOwner, validateReview, wrapAsync(async (req, res) => {
  const { reviewId } = req.params;
  const updated = await Review.findByIdAndUpdate(reviewId, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: 'Review not found' });
  res.json(updated);
}));

// Delete review (user can only delete their own review)
app.delete('/reviews/:reviewId', requireReviewOwner, wrapAsync(async (req, res) => {
  await Review.findByIdAndDelete(req.params.reviewId);
  res.json({ message: 'Review deleted successfully' });
}));

app.get('/reviews/average/:listingId', wrapAsync(async (req, res) => {
  const { listingId } = req.params;
  const result = await Review.aggregate([
    { $match: { listingId: new mongoose.Types.ObjectId(listingId) } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } }
  ]);
  res.json({ averageRating: result[0]?.avgRating || 0 });
}));

// --- Serve React frontend build in production ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend2/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend2/build/index.html'));
  });
}

const listEndpoints = require('express-list-endpoints');
console.log("🔍 Registered Routes:");
console.log(listEndpoints(app));


const PORT = process.env.PORT || 8030;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

