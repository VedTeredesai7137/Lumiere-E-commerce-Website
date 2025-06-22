import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import Footbar from './footbar';
import ErrorMessage from './components/ErrorMessage';
import api from './config/api.js';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

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
          fetchCart(userData._id);
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

  const fetchCart = async (userId) => {
    try {
      setLoading(true);
      const response = await api.get(`/cart/${userId}`, {
        withCredentials: true
      });
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      await api.delete(`/cart/${userId}/${productId}`, {
        withCredentials: true
      });
      fetchCart(userId);
    } catch (error) {
      console.error("Error removing item:", error);
      setError("Failed to remove item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      await api.patch(
        `/cart/${userId}/${productId}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );
      fetchCart(userId);
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("Failed to update quantity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    
    // Navigate to place order with cart data
    navigate('/placeorder', { 
      state: { 
        cartItems: cartItems,
        userId: userId,
        totalAmount: totalAmount
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-300 mb-4"></div>
              <p className="text-xl text-gray-600 font-medium">Loading your cart...</p>
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
            Your Shopping Cart
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-300 to-orange-400 mx-auto rounded-full"></div>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                </svg>
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">Your cart is empty</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Discover our exquisite collection of handcrafted jewelry and find pieces that speak to your heart.
              </p>
              <Link 
                to="/" 
                className="inline-flex items-center gap-3 bg-orange-300 text-white px-10 py-4 rounded-full font-medium hover:bg-orange-400 hover:scale-105 transition-all transform shadow-lg text-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-300 to-orange-400 px-6 py-4">
                  <h2 className="text-xl font-serif font-bold text-white">
                    Cart Items ({cartItems.length})
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-6">
                        {/* Product Image */}
                        <div className="relative group">
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            className="w-24 h-24 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-serif font-semibold text-gray-800 mb-2 truncate">
                            {item.product.title}
                          </h3>
                          <p className="text-lg font-medium text-orange-400 mb-2">
                            ₹{item.product.price.toLocaleString()}
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleUpdateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                disabled={loading}
                              >
                                -
                              </button>
                              <span className="px-4 py-1 bg-white text-gray-800 font-medium min-w-12 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                disabled={loading}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Price and Remove */}
                        <div className="text-right">
                          <p className="text-2xl font-serif font-bold text-gray-800 mb-3">
                            ₹{(item.quantity * item.product.price).toLocaleString()}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="inline-flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition-colors"
                            disabled={loading}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-orange-300 to-orange-400 px-6 py-4">
                  <h2 className="text-xl font-serif font-bold text-white">Order Summary</h2>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Summary Details */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-800">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium text-gray-800">Calculated at checkout</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-serif font-bold text-gray-800">Total</span>
                        <span className="text-2xl font-serif font-bold text-gray-800">₹{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Checkout Button */}
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-orange-300 text-white py-4 rounded-full font-medium hover:bg-orange-400 hover:scale-105 transition-all transform shadow-lg text-lg"
                    disabled={loading || cartItems.length === 0}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </button>
                  
                  {/* Continue Shopping */}
                  <Link
                    to="/"
                    className="block w-full text-center border-2 border-orange-300 text-orange-300 py-3 rounded-full font-medium hover:bg-orange-300 hover:text-white transition-all"
                  >
                    Continue Shopping
                  </Link>
                  
                  {/* Security Notice */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      Your payment information is secure and encrypted
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footbar />
    </div>
  );
};

export default CartPage;
