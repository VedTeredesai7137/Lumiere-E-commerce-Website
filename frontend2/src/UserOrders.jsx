import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import Footbar from './footbar';
import ErrorMessage from './components/ErrorMessage';
import api from './config/api.js';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/check-auth", {
          withCredentials: true
        });
        if (response.data.status === "ok") {
          const userData = response.data.user;
          sessionStorage.setItem('userData', JSON.stringify(userData));
          setUserId(userData._id);
          fetchOrders(userData._id);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchOrders = async (userId) => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/user/${userId}`, {
        withCredentials: true
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(((error.response?.data?.error) || "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Order Placed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-300 mb-4"></div>
              <p className="text-xl text-gray-600 font-medium">Loading your orders...</p>
            </div>
          </div>
        </div>
        <Footbar />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-800 mb-4">
            My Order History
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-300 to-orange-400 mx-auto rounded-full"></div>
        </div>

        {orders.length === 0 ? (
          /* Empty Orders State */
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">No orders yet</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Start your jewelry journey by exploring our exquisite collection and placing your first order.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-3 bg-orange-300 text-white px-10 py-4 rounded-full font-medium hover:bg-orange-400 hover:scale-105 transition-all transform shadow-lg text-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-orange-300 to-orange-400 px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-white">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-orange-100 text-sm">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  {/* Products */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Products</h4>
                    <div className="space-y-3">
                      {order.products.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {item.productId?.title || 'Product not found'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">
                              ₹{(item.productId?.price || 0) * item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Shipping Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-800">{order.shippingInfo?.fullName}</p>
                      <p className="text-gray-600">{order.shippingInfo?.email}</p>
                      <p className="text-gray-600">{order.shippingInfo?.phone}</p>
                      <p className="text-gray-600">
                        {order.shippingInfo?.addressLine1}
                        {order.shippingInfo?.addressLine2 && <br />}
                        {order.shippingInfo?.addressLine2}
                      </p>
                      <p className="text-gray-600">
                        {order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.zipCode}
                      </p>
                      <p className="text-gray-600">{order.shippingInfo?.country}</p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                      <span className="text-2xl font-serif font-bold text-gray-800">
                        ₹{order.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footbar />
    </div>
  );
};

export default UserOrders; 