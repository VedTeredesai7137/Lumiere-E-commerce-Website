import React, { useState, useEffect } from 'react';
import './App.css'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from './config/api.js';

const Navbar = () => {
  const [userData, setUserData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/check-auth", {
          withCredentials: true
        });
        if (response.data.status === "ok") {
          const userData = response.data.user;
          sessionStorage.setItem("userData", JSON.stringify(userData));
          setUserData(userData);
          setAdminData(userData.role === "admin" ? userData : null);
          fetchCartCount(userData._id);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        sessionStorage.removeItem("userData");
        sessionStorage.removeItem("adminData");
        setUserData(null);
        setAdminData(null);
      }
    };

    checkAuth();

    // Close mobile menu when clicking outside
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  const fetchCartCount = async (userId) => {
    try {
      const response = await api.get(`/cart/${userId}`, {
        withCredentials: true
      });
      if (response.data && response.data.items) {
        setCartCount(response.data.items.length);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
      sessionStorage.removeItem("userData");
      sessionStorage.removeItem("adminData");
      setUserData(null);
      setAdminData(null);
      setCartCount(0);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const response = await fetch('/listings');
        const listings = await response.json();
        const foundListing = listings.find(listing => 
          listing.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (foundListing) {
          navigate(`/product/${foundListing._id}`);
        } else {
          alert("No product found matching your search");
        }
      } catch (error) {
        console.error("Error searching:", error);
      }
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      {/* First Tier - Main Navigation */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left Section - Company Name + Quick Links */}
            <div className="flex items-center space-x-12">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link to="/" className="block">
                  <h1 className="text-2xl font-serif font-bold text-gray-800">Lumière</h1>
                  <p className="text-xs text-orange-400 -mt-1 tracking-wider">FINE JEWELRY</p>
                </Link>
              </div>

              {/* Desktop Quick Links */}
              <div className="hidden lg:flex items-center space-x-12">
              <Link to="/home" className="text-sm text-gray-700 hover:text-orange-400 transition-colors font-medium">
                  Home
                </Link>
                <Link to="/profile" className="text-sm text-gray-700 hover:text-orange-400 transition-colors font-medium">
                  Profile
                </Link>
                <Link to="/contact" className="text-sm text-gray-700 hover:text-orange-400 transition-colors font-medium">
                  Contact Us
                </Link>
                {userData && (
                  <Link to="/myorders" className="text-sm text-gray-700 hover:text-orange-400 transition-colors font-medium">
                    My Orders
                  </Link>
                )}
              </div>
            </div>

            {/* Center Section - Large Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  placeholder="Search for rings, necklaces, earrings..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-6 text-gray-700 bg-gradient-to-r from-orange-50 to-orange-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all duration-200 text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </form>
            </div>

            {/* Right Section - Cart + User Actions */}
            <div className="flex items-center space-x-12">
              {/* Home Link (to the left of cart icon, only show on mobile) */}
              <Link to="/home" className="block md:hidden text-sm text-gray-700 hover:text-orange-400 transition-colors font-medium">
                Home
              </Link>
              {/* Cart Icon with Badge */}
              <Link to="/cartpage" className="relative group">
                <div className="p-2 rounded-full hover:bg-gray-50 transition-colors">
                  <svg className="w-6 h-6 text-gray-700 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-400 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User Authentication Section */}
              <div className="hidden md:flex items-center space-x-12">
                {userData || adminData ? (
                  <div className="flex items-center space-x-12">
                    <span className="text-sm text-gray-600">
                      Welcome,{" "}
                      <span className="font-semibold text-orange-400">
                        {userData?.name || userData?.username || adminData?.username || 'Guest'}
                      </span>
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-12">
                    <Link
                      to="/login"
                      className="text-sm text-orange-400 hover:text-orange-500 font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="text-sm text-orange-400 hover:text-orange-500 font-medium transition-colors"
                    >
                      Register
                    </Link>
                    
                  </div>
                )}
                
                {/* Admin Order Management Link */}
                {adminData && (
                  <Link
                    to="/adminorder"
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    Manage Orders
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden mobile-menu-container">
                <button 
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg text-gray-700 hover:text-orange-400 hover:bg-gray-50 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Tier - Category Navigation */}
      <div className="hidden md:block bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-14 space-x-25">
            <Link 
              to="/rings" 
              className="text-gray-700 hover:text-orange-400 font-medium text-sm uppercase tracking-wide transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-orange-400"
            >
              Rings
            </Link>
            <Link 
              to="/bracelets" 
              className="text-gray-700 hover:text-orange-400 font-medium text-sm uppercase tracking-wide transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-orange-400"
            >
              Bracelets
            </Link>
            <Link 
              to="/earrings" 
              className="text-gray-700 hover:text-orange-400 font-medium text-sm uppercase tracking-wide transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-orange-400"
            >
              Earrings
            </Link>
            <Link 
              to="/necklaces" 
              className="text-gray-700 hover:text-orange-400 font-medium text-sm uppercase tracking-wide transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-orange-400"
            >
              Necklaces
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out mobile-menu-container" onClick={(e) => e.stopPropagation()}>
            
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-serif font-bold text-gray-800">Menu</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Search Bar */}
            <div className="p-6 border-b border-gray-100">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search jewelry..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Mobile Menu Items */}
            <div className="flex-1 overflow-y-auto">
              
              {/* User Info Section */}
              {userData && false && (
                <div className="p-6 bg-orange-50 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {userData.username && userData.username.charAt ? userData.username.charAt(0).toUpperCase() : ''}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {userData.username}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="py-4">
                
                {/* Category Links */}
                <div className="px-6 pb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Categories</h3>
                  <div className="space-y-1">
                    <Link to="/rings" className="flex items-center py-3 text-gray-700 hover:text-orange-400 hover:bg-orange-50 rounded-lg px-3 transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                      <span className="text-sm font-medium">Rings</span>
                    </Link>
                    <Link to="/bracelets" className="flex items-center py-3 text-gray-700 hover:text-orange-400 hover:bg-orange-50 rounded-lg px-3 transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                      <span className="text-sm font-medium">Bracelets</span>
                    </Link>
                    <Link to="/earrings" className="flex items-center py-3 text-gray-700 hover:text-orange-400 hover:bg-orange-50 rounded-lg px-3 transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                      <span className="text-sm font-medium">Earrings</span>
                    </Link>
                    <Link to="/necklaces" className="flex items-center py-3 text-gray-700 hover:text-orange-400 hover:bg-orange-50 rounded-lg px-3 transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                      <span className="text-sm font-medium">Necklaces</span>
                    </Link>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="px-6 pb-4 border-t border-gray-100 pt-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Links</h3>
                  <div className="space-y-1">
                    <Link to="/profile" className="flex items-center py-3 text-gray-700 hover:text-orange-400 hover:bg-orange-50 rounded-lg px-3 transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium">Profile</span>
                    </Link>
                    {/* Add Contact Us and My Orders below Profile in mobile menu */}
                    <Link to="/contact" className="flex items-center py-3 text-gray-700 hover:text-orange-400 hover:bg-orange-50 rounded-lg px-3 transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10.5a8.38 8.38 0 01-7.5 7.5A8.38 8.38 0 013 10.5C3 6.36 7.03 3 12 3s9 3.36 9 7.5z" />
                      </svg>
                      <span className="text-sm font-medium">Contact Us</span>
                    </Link>
                    {userData && (
                      <Link to="/myorders" className="flex items-center py-3 text-gray-700 hover:text-orange-400 hover:bg-orange-50 rounded-lg px-3 transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium">My Orders</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Authentication */}
                <div className="px-6 border-t border-gray-100 pt-4">
                  {userData || adminData ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center py-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 transition-all duration-200 w-full"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center py-3 text-orange-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg px-3 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-medium">Sign In</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;