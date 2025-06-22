import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from './config/api.js';
import ErrorMessage from './components/ErrorMessage';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/orders", {
        withCredentials: true
      });
      setOrders(res.data);
    } catch (error) {
      console.error(error);
      setError(((error.response?.data?.message) || "Access denied or server error"));
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await api.put(`/orders/${orderId}/status`, {
        status: newStatus
      }, { withCredentials: true });
      
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      alert("Order status updated successfully!");
    } catch (error) {
      console.error(error);
      alert(((error.response?.data?.message) || "Failed to update order status"));
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-300 mb-4"></div>
            <p className="text-xl text-gray-600 font-medium">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">All Customer Orders</h1>
      {orders.length === 0 ? (
        <p className="text-center py-8 text-gray-600">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">Customer</th>
                <th className="py-2 px-4">Products</th>
                <th className="py-2 px-4">Total</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-t">
                  <td className="py-2 px-4">
                    {order.shippingInfo?.fullName || 'N/A'}<br />
                    <span className="text-sm text-gray-500">{order.shippingInfo?.email || 'N/A'}</span>
                  </td>
                  <td className="py-2 px-4">
                    {order.products?.map(p => (
                      <div key={p.productId?._id || p.productId}>
                        {p.productId?.title || 'Product not found'} × {p.quantity}
                      </div>
                    )) || 'No products'}
                  </td>
                  <td className="py-2 px-4">₹{order.totalAmount}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Order Placed' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      disabled={updatingStatus === order._id}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Order Placed">Order Placed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {updatingStatus === order._id && (
                      <span className="ml-2 text-xs text-gray-500">Updating...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
