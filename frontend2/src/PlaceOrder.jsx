import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css'

const PlaceOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get cart data from navigation state
  const cartItems = location.state?.cartItems || [];
  const userId = location.state?.userId;
  const totalAmount = location.state?.totalAmount || 0;

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    notes: ''
  });

  // Redirect if no cart data
  useEffect(() => {
    if (!cartItems.length || !userId) {
      navigate('/cartpage');
    }
  }, [cartItems, userId, navigate]);

  const handleChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const required = ['fullName', 'phone', 'email', 'addressLine1', 'city', 'state', 'zipCode'];
    for (let field of required) {
      if (!shippingInfo[field].trim()) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    const products = cartItems.map(item => ({
      productId: item.product._id,
      quantity: item.quantity
    }));

    try {
      const res = await axios.post("http://localhost:8030/orders", {
        userId,
        products,
        totalAmount,
        shippingInfo
      }, {
        withCredentials: true
      });

      alert("Order placed successfully!");
      navigate('/home'); // Redirect to home after successful order
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems.length || !userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-12">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Shipping Details</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            name="fullName" 
            placeholder="Full Name *" 
            value={shippingInfo.fullName}
            onChange={handleChange} 
            className="input" 
            required
          />
          <input 
            name="phone" 
            placeholder="Phone Number *" 
            value={shippingInfo.phone}
            onChange={handleChange} 
            className="input" 
            required
          />
          <input 
            name="email" 
            placeholder="Email *" 
            value={shippingInfo.email}
            onChange={handleChange} 
            className="input" 
            required
          />
          <input 
            name="addressLine1" 
            placeholder="Address Line 1 *" 
            value={shippingInfo.addressLine1}
            onChange={handleChange} 
            className="input" 
            required
          />
          <input 
            name="addressLine2" 
            placeholder="Address Line 2" 
            value={shippingInfo.addressLine2}
            onChange={handleChange} 
            className="input" 
          />
          <input 
            name="city" 
            placeholder="City *" 
            value={shippingInfo.city}
            onChange={handleChange} 
            className="input" 
            required
          />
          <input 
            name="state" 
            placeholder="State *" 
            value={shippingInfo.state}
            onChange={handleChange} 
            className="input" 
            required
          />
          <input 
            name="zipCode" 
            placeholder="ZIP Code *" 
            value={shippingInfo.zipCode}
            onChange={handleChange} 
            className="input" 
            required
          />
          <input 
            name="country" 
            placeholder="Country" 
            value={shippingInfo.country} 
            onChange={handleChange} 
            className="input" 
          />
          <textarea 
            name="notes" 
            placeholder="Additional Notes" 
            value={shippingInfo.notes}
            onChange={handleChange} 
            className="col-span-2 input h-24 resize-none" 
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Cart Summary</h3>
          <ul className="mb-4 space-y-2">
            {cartItems.map(item => (
              <li key={item.product._id} className="flex justify-between border-b py-1">
                <span>{item.product.title} × {item.quantity}</span>
                <span>₹{item.product.price * item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="text-right font-bold text-xl">Total: ₹{totalAmount}</div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full shadow-lg font-medium transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default PlaceOrder;
