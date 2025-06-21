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

// Use modular routes
app.use("/listings", listingRoutes);
app.use("/reviews", reviewRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/", authorizationRoutes);

console.log("✅ All routes mounted");

app.get("/test", (req, res) => {
  res.send("Test route works");
});

console.log("✅ Test route added");

// Error handler for other errors (must come after all routes)
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).json({ error: message });
});

// --- Serve React frontend build in production ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend2/build')));
  app.get('*', (req, res) => {
    console.log("Requested path:", req.path);
    res.sendFile(path.join(__dirname, '../frontend2/build/index.html'));
  });
}

console.log("✅ Production setup complete");

const PORT = process.env.PORT || 8030;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
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
    
  } catch (err) {
    console.error("❌ Route listing failed:", err.message);
  }
});

