import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './App.css';
import ErrorMessage from './components/ErrorMessage';

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if admin is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:8030/check-auth", {
          withCredentials: true
        });
        if (response.data.status === "ok" && response.data.user.role === "admin") {
          sessionStorage.setItem('adminData', JSON.stringify(response.data.user));
          navigate("/adminorder");
        }
      } catch (err) {
        console.error("Auth check error:", err);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const result = await axios.post("http://localhost:8030/adminlogin", 
        { username, password },
        { withCredentials: true }
      );
      
      if (result.data.status === "ok") {
        sessionStorage.setItem('adminData', JSON.stringify(result.data.admin));
        navigate("/adminorder");
      } else {
        setError(result.data.error || "Login failed. Check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-serif font-bold text-gray-800 mb-8 text-center">Admin Login</h2>
        {error && <ErrorMessage error={error} />}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter admin username"
              autoComplete="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition duration-200 text-gray-800"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition duration-200 text-gray-800"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-600 text-white py-3 rounded-md hover:bg-gray-700 hover:scale-105 transition-all duration-200 font-medium text-base shadow-sm"
          >
            Admin Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
