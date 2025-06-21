/* eslint-env node */
const EcommCustomerModel = require("../models/EcommCustomer.js");
const adminModel = require("../models/admin.js");

// User login
const userLogin = async (req, res) => {
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
};

// User registration
const userRegister = async (req, res) => {
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
};

// Admin login
const adminLogin = async (req, res) => {
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
};

// User logout
const userLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.json({ status: "error", error: "Error logging out" });
    }
    res.clearCookie("connect.sid");
    res.json({ status: "ok" });
  });
};

// Check authentication status
const checkAuth = (req, res) => {
  if (req.session.user) {
    res.json({
      status: "ok",
      user: req.session.user
    });
  } else {
    res.json({ status: "error", message: "Not authenticated" });
  }
};

module.exports = {
  userLogin,
  userRegister,
  adminLogin,
  userLogout,
  checkAuth
}; 