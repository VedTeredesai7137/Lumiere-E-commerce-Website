/* eslint-env node */
const express = require('express');
const router = express.Router();

const {
  userLogin,
  userRegister,
  adminLogin,
  userLogout,
  checkAuth
} = require('../controllers/authorizationController.js');

// User login
router.post('/login', userLogin);

// User registration
router.post('/register', userRegister);

// Admin login
router.post('/adminlogin', adminLogin);

// User logout
router.post('/logout', userLogout);

// Check authentication status
router.get('/check-auth', checkAuth);

module.exports = router; 