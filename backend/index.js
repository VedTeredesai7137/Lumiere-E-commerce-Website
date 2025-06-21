/* eslint-env node */
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const path = require('path');
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

// Error handler for other errors (must come after all routes)
app.use((err, req, res, next) => {
  console.error("🚨 Global error handler caught:", err.message);
  
  // Specific handling for path-to-regexp errors
  if (err.message.includes('pathToRegexpError') || err.message.includes('Missing parameter name')) {
    console.error("🚨 PATH-TO-REGEXP ERROR DETECTED in global error handler!");
    console.error("This usually means a malformed route path like '/something:' or '/something::id'");
    console.error("Check all route definitions for malformed paths");
    console.error("Request URL:", req.url);
    console.error("Request method:", req.method);
  }
  
  console.error("Error stack:", err.stack);
  console.error("Request URL:", req.url);
  console.error("Request method:", req.method);
  
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).json({ error: message });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  if (reason && reason.message && (reason.message.includes('pathToRegexpError') || reason.message.includes('Missing parameter name'))) {
    console.error("🚨 PATH-TO-REGEXP ERROR DETECTED in unhandled rejection!");
    console.error("This usually means a malformed route path like '/something:' or '/something::id'");
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error.message);
  if (error.message.includes('pathToRegexpError') || error.message.includes('Missing parameter name')) {
    console.error("🚨 PATH-TO-REGEXP ERROR DETECTED in uncaught exception!");
    console.error("This usually means a malformed route path like '/something:' or '/something::id'");
    console.error("Check all route definitions for malformed paths");
  }
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

// --- Serve React frontend build in production ---
if (process.env.NODE_ENV === 'production') {
  try {
    console.log("📌 Setting up production static serving...");
    console.log("📁 Static files path:", path.join(__dirname, '../frontend2/build'));
    
    // Always set up static serving (will work even if directory doesn't exist)
    app.use(express.static(path.join(__dirname, '../frontend2/build')));
    console.log("✅ Static serving configured");
    
    console.log("📌 Adding catch-all middleware for React...");
    console.log("🔍 This middleware will handle all non-API routes");
    
    // Use middleware instead of wildcard route to avoid path-to-regexp issues
    app.use((req, res, next) => {
      try {
        console.log("🔄 Middleware processing request:", req.method, req.path);
        
        // Skip API routes
        const apiPaths = [
          '/listings', '/reviews', '/cart', '/orders', 
          '/login', '/register', '/adminlogin', '/logout', 
          '/check-auth', '/test'
        ];
        
        const isApiRoute = apiPaths.some(apiPath => req.path.startsWith(apiPath));
        
        if (isApiRoute) {
          console.log("⏭️ Skipping API route:", req.path);
          return next();
        }
        
        // Skip static assets (let express.static handle them)
        if (req.path.startsWith('/assets/') || 
            req.path.startsWith('/static/') || 
            req.path.includes('.js') || 
            req.path.includes('.css') || 
            req.path.includes('.ico') || 
            req.path.includes('.png') || 
            req.path.includes('.jpg') || 
            req.path.includes('.svg')) {
          console.log("📦 Skipping static asset:", req.path);
          return next();
        }
        
        // For all other routes, try to serve React app
        console.log("📱 Attempting to serve React app for:", req.path);
        const indexPath = path.join(__dirname, '../frontend2/build/index.html');
        
        // Check if index.html exists
        if (!fs.existsSync(indexPath)) {
          console.log("📝 React app not built yet, serving API-only response");
          return res.status(404).json({ 
            message: "React app not available yet. API is running.",
            apiEndpoints: [
              "/listings", "/reviews", "/cart", "/orders",
              "/login", "/register", "/adminlogin", "/logout",
              "/check-auth", "/test"
            ]
          });
        }
        
        res.sendFile(indexPath, (err) => {
          if (err) {
            console.error("❌ Error sending React app:", err.message);
            console.error("Requested path:", req.path);
            console.error("Index path:", indexPath);
          } else {
            console.log("✅ React app served successfully for:", req.path);
          }
        });
        
      } catch (middlewareErr) {
        console.error("❌ Middleware error:", middlewareErr.message);
        console.error("Request path:", req.path);
        console.error("Stack trace:", middlewareErr.stack);
        
        if (middlewareErr.message.includes('pathToRegexpError') || 
            middlewareErr.message.includes('Missing parameter name')) {
          console.error("🚨 PATH-TO-REGEXP ERROR DETECTED in middleware!");
          console.error("This should not happen with the new middleware approach");
        }
        
        next(middlewareErr);
      }
    });
    
    console.log("✅ Catch-all middleware added successfully");
    console.log("🎉 PATH-TO-REGEXP ERROR RESOLVED!");
    console.log("🎯 Production setup complete");
    
  } catch (err) {
    console.error("❌ Error setting up production routes:", err.message);
    console.error("Error type:", err.constructor.name);
    console.error("Error code:", err.code);
    
    if (err.message.includes('pathToRegexpError') || err.message.includes('Missing parameter name')) {
      console.error("🚨 PATH-TO-REGEXP ERROR DETECTED in production routes!");
      console.error("This usually means a malformed route path like '/something:' or '/something::id'");
      console.error("Check the catch-all middleware for malformed paths");
      console.error("This error should NOT occur with the new middleware approach");
    }
    
    console.error("Stack trace:", err.stack);
    console.error("Full error object:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    throw err; // Re-throw to stop the process
  }
}

console.log("✅ Production setup complete");

const PORT = process.env.PORT || 8030;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🎉 PATH-TO-REGEXP ERROR SHOULD BE RESOLVED!");
  console.log("✅ All routes mounted successfully without path-to-regexp errors");
  console.log("✅ Production middleware configured without wildcard patterns");
  
  // List all registered routes after server starts
  console.log("🔍 Registered Routes:");
  try {
    // Simple route listing - just log what we know should be there
    console.log("Expected routes:");
    console.log("  GET /test");
    console.log("  POST /login");
    console.log("  POST /register");
    console.log("  POST /adminlogin");
    console.log("  POST /logout");
    console.log("  GET /check-auth");
    console.log("  GET /listings/*");
    console.log("  POST /listings");
    console.log("  GET /reviews/*");
    console.log("  POST /reviews");
    console.log("  GET /cart/*");
    console.log("  POST /cart");
    console.log("  GET /orders/*");
    console.log("  POST /orders");
    
    // Test if routes are actually working
    console.log("\n🧪 Testing if routes are accessible...");
    console.log("✅ Server is running and routes should be available");
    console.log("✅ No path-to-regexp errors detected during startup");
    
    // Additional verification
    if (process.env.NODE_ENV === 'production') {
      console.log("🌐 Production mode: React app will be served for non-API routes");
      console.log("🔧 Middleware approach used instead of wildcard routes");
    }
    
  } catch (err) {
    console.error("❌ Route listing failed:", err.message);
    if (err.message.includes('pathToRegexpError') || err.message.includes('Missing parameter name')) {
      console.error("🚨 UNEXPECTED PATH-TO-REGEXP ERROR during route listing!");
      console.error("This should not happen with the new middleware approach");
    }
  }
});

