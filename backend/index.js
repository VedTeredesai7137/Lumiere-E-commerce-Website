/* eslint-env node */
const path = require('path');
const history = require('connect-history-api-fallback');

// Always load environment variables, but prefer production env vars if available
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const fs = require('fs');

const EcommCustomerModel = require("./models/EcommCustomer.js");
const adminModel = require("./models/admin.js");
const Cart = require("./models/cart.js");

// Import modular routes
const listingRoutes = require("./routes/listingRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const authorizationRoutes = require("./routes/authorization.js");

console.log("✅ All route files imported successfully");

// Debug: Check route objects
console.log("🔍 Debugging route objects:");
console.log("listingRoutes type:", typeof listingRoutes);
console.log("reviewRoutes type:", typeof reviewRoutes);
console.log("cartRoutes type:", typeof cartRoutes);
console.log("orderRoutes type:", typeof orderRoutes);
console.log("authorizationRoutes type:", typeof authorizationRoutes);

const app = express();

// Log important environment variables
console.log("Session secret:", process.env.SECRET ? "Set" : "Not set");
console.log("MongoDB URL:", process.env.ATLASDB_URL ? "Set" : "Not set");
console.log("Node environment:", process.env.NODE_ENV);

const dbUrl = process.env.ATLASDB_URL;

// Check if required environment variables are set
if (!dbUrl) {
  console.error("❌ ATLASDB_URL environment variable is not set!");
  console.error("Please set your MongoDB connection string in the .env file or environment variables");
  process.exit(1);
}

if (!process.env.SECRET) {
  console.error("❌ SECRET environment variable is not set!");
  console.error("Please set your session secret in the .env file or environment variables");
  process.exit(1);
}

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
  origin: process.env.NODE_ENV === "production" 
    ? ["https://lumiere-csxw.onrender.com", "https://www.lumiere-csxw.onrender.com"]
    : "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session(sessionOptions));

console.log("✅ Middleware setup complete");

// Use modular routes with detailed error handling
console.log("🔧 Mounting routes with error handling...");

// Wrap entire route mounting in try-catch for path-to-regexp errors
try {
  console.log("📌 Mounting /listings routes...");
  app.use("/listings", listingRoutes);
  console.log("✅ /listings routes mounted successfully");
} catch (err) {
  console.error("❌ Error mounting /listings routes:", err.message);
  if (err.message.includes('pathToRegexpError') || err.message.includes('Missing parameter name')) {
    console.error("🚨 PATH-TO-REGEXP ERROR DETECTED in /listings routes!");
    console.error("This usually means a malformed route path like '/something:' or '/something::id'");
    console.error("Check all routes in listingRoutes.js for malformed paths");
  }
  console.error("Stack trace:", err.stack);
  throw err; // Re-throw to stop the process
}

try {
  console.log("📌 Mounting /reviews routes...");
  app.use("/reviews", reviewRoutes);
  console.log("✅ /reviews routes mounted successfully");
} catch (err) {
  console.error("❌ Error mounting /reviews routes:", err.message);
  if (err.message.includes('pathToRegexpError') || err.message.includes('Missing parameter name')) {
    console.error("🚨 PATH-TO-REGEXP ERROR DETECTED in /reviews routes!");
    console.error("This usually means a malformed route path like '/something:' or '/something::id'");
    console.error("Check all routes in reviewRoutes.js for malformed paths");
  }
  console.error("Stack trace:", err.stack);
  throw err; // Re-throw to stop the process
}

try {
  console.log("📌 Mounting /cart routes...");
  app.use("/cart", cartRoutes);
  console.log("✅ /cart routes mounted successfully");
  } catch (err) {
  console.error("❌ Error mounting /cart routes:", err.message);
  if (err.message.includes('pathToRegexpError') || err.message.includes('Missing parameter name')) {
    console.error("🚨 PATH-TO-REGEXP ERROR DETECTED in /cart routes!");
    console.error("This usually means a malformed route path like '/something:' or '/something::id'");
    console.error("Check all routes in cartRoutes.js for malformed paths");
  }
  console.error("Stack trace:", err.stack);
  throw err; // Re-throw to stop the process
}

try {
  console.log("📌 Mounting /orders routes...");
  app.use("/orders", orderRoutes);
  console.log("✅ /orders routes mounted successfully");
  } catch (err) {
  console.error("❌ Error mounting /orders routes:", err.message);
  if (err.message.includes('pathToRegexpError') || err.message.includes('Missing parameter name')) {
    console.error("🚨 PATH-TO-REGEXP ERROR DETECTED in /orders routes!");
    console.error("This usually means a malformed route path like '/something:' or '/something::id'");
    console.error("Check all routes in orderRoutes.js for malformed paths");
  }
  console.error("Stack trace:", err.stack);
  throw err; // Re-throw to stop the process
}

try {
  console.log("📌 Mounting authorization routes...");
  app.use("/", authorizationRoutes);
  console.log("✅ Authorization routes mounted successfully");
  } catch (err) {
  console.error("❌ Error mounting authorization routes:", err.message);
  if (err.message.includes('pathToRegexpError') || err.message.includes('Missing parameter name')) {
    console.error("🚨 PATH-TO-REGEXP ERROR DETECTED in authorization routes!");
    console.error("This usually means a malformed route path like '/something:' or '/something::id'");
    console.error("Check all routes in authorization.js for malformed paths");
  }
  console.error("Stack trace:", err.stack);
  throw err; // Re-throw to stop the process
}

console.log("✅ All routes mounted");

try {
  console.log("📌 Adding test route...");
  app.get("/test", (req, res) => {
    res.send("Test route works");
  });
  console.log("✅ Test route added successfully");
} catch (err) {
  console.error("❌ Error adding test route:", err.message);
  if (err.message.includes('pathToRegexpError') || err.message.includes('Missing parameter name')) {
    console.error("🚨 PATH-TO-REGEXP ERROR DETECTED in test route!");
    console.error("This usually means a malformed route path like '/something:' or '/something::id'");
  }
  console.error("Stack trace:", err.stack);
  throw err; // Re-throw to stop the process
}

console.log("✅ Test route added");

// --- Production static file serving (AFTER all API routes) ---
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../frontend2/build');

  app.use(history({
    rewrites: [
      { from: /^\/(listings|reviews|cart|orders|login|register|adminlogin|logout|check-auth)/, to: ctx => ctx.parsedUrl.pathname },
      { from: /^\/assets\/.*$/, to: ctx => ctx.parsedUrl.pathname }
    ]
  }));

  app.use(express.static(staticPath));
}

// Error handler for other errors (must come after all routes)
app.use((err, req, res, next) => {
  console.error("🚨 Global error handler caught:", err.message);
  console.error("Error stack:", err.stack);
  console.error("Request URL:", req.url);
  console.error("Request method:", req.method);
  
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).json({ error: message });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

const PORT = process.env.PORT || 8030;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ All routes mounted successfully");
  
  if (process.env.NODE_ENV === 'production') {
    console.log("🌐 Production mode: React app will be served for non-API routes");
  }
});
  
  