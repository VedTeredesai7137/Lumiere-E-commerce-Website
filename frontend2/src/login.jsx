import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './App.css'
import ErrorMessage from './components/ErrorMessage';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:8030/check-auth", {
          withCredentials: true
        });
        if (response.data.status === "ok") {
          // Store user data in sessionStorage
          sessionStorage.setItem('userData', JSON.stringify(response.data.user));
          navigate("/home");
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
      const result = await axios.post("http://localhost:8030/login", 
        { email, password },
        { withCredentials: true }
      );
      
      if (result.data.status === "ok" && result.data.result) {
        const userData = result.data.result;
        console.log("User data from response:", userData);
        
        // Store user data in sessionStorage
        sessionStorage.setItem('userData', JSON.stringify(userData));
        
        navigate("/home");
      } else {
        setError(result.data.error || "Login failed. Check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again later.");
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-serif font-bold text-gray-800 mb-8 text-center">Sign In</h2>
        {error && <ErrorMessage error={error} />}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition duration-200 text-gray-800"
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition duration-200 text-gray-800"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              className="text-sm text-orange-400 hover:text-orange-500 transition duration-200"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-300 text-white py-3 rounded-md hover:bg-orange-400 hover:scale-105 transition-all duration-200 font-medium text-base shadow-sm"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-600">Don't have an account?</span>
          <button
            type="button"
            onClick={handleRegisterRedirect}
            className="ml-2 text-orange-400 hover:text-orange-500 font-medium"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;