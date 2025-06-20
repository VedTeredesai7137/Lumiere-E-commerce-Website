import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './App.css'

function Signup() {
  const [name, setName] = useState("");
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
      const result = await axios.post("http://localhost:8030/register", 
        { name, email, password },
        { withCredentials: true }
      );
      console.log("Registration response:", result.data);
      if (result.data._id) {
        // After successful registration, automatically log in the user
        const loginResult = await axios.post("http://localhost:8030/login",
          { email, password },
          { withCredentials: true }
        );
        
        if (loginResult.data.status === "ok") {
          sessionStorage.setItem('userData', JSON.stringify(loginResult.data.result));
          navigate("/home");
        } else {
          alert("Registration successful! Please login.");
          navigate("/login");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm border border-orange-100">
        <h2 className="text-2xl font-serif font-bold mb-6 text-center text-gray-800">
          Create Account
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              autoComplete="off"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition duration-200 text-gray-800"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              autoComplete="off"
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
              placeholder="Create a password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition duration-200 text-gray-800"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-300 text-white py-3 rounded-md hover:bg-orange-400 hover:scale-105 transition-all duration-200 font-medium text-base shadow-sm"
          >
            Create Account
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 mb-3">
              Already have an account?
            </p>

            <Link
              to="/login"
              className="inline-block w-full py-3 border border-orange-300 rounded-md text-orange-400 hover:bg-orange-50 hover:text-orange-500 transition-all duration-200 font-medium text-base text-center"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;