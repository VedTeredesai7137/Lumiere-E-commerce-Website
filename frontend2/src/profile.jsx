import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';
import Navbar from './navbar';
import Footbar from './footbar';
import ErrorMessage from './components/ErrorMessage';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:8030/check-auth", {
          withCredentials: true
        });
        if (response.data.status === "ok") {
          const user = response.data.user;
          setUserData(user);
          sessionStorage.setItem('userData', JSON.stringify(user));
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Auth check error:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-serif font-bold text-gray-800 mb-6">Profile</h1>
          
          {userData && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h2 className="text-lg font-medium text-gray-600">Name</h2>
                <p className="text-xl text-gray-800">{userData.name}</p>
              </div>
              
              <div className="border-b pb-4">
                <h2 className="text-lg font-medium text-gray-600">Email</h2>
                <p className="text-xl text-gray-800">{userData.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footbar />
    </div>
  );
}

export default Profile; 