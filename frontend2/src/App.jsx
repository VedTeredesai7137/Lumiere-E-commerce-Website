import { useState } from 'react';
import Signup from './signup.jsx';
import {BrowserRouter, Routes, Route,} from 'react-router-dom';
import Login from './login.jsx';
import Home from './home.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import AdminLogin from './adminlogin.jsx';
import CreateListing from './CreateListing.jsx';
import ProductPage from './productpage.jsx';
import CartPage from './cartpage.jsx';
import PlaceOrder from './PlaceOrder.jsx';
import AdminOrders from './AdminOrders.jsx';
import UserOrders from './UserOrders.jsx';
import Profile from './profile.jsx';
import Contact from './Contact.jsx';
import EditProduct from './editproduct.jsx';
import ListPage from './listpage.jsx';
import ErrorMessage from './components/ErrorMessage';

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/:category" element={<ListPage />} />
          <Route path="/cartpage" element={<CartPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/placeorder" element={
            <ProtectedRoute>
              <PlaceOrder />
            </ProtectedRoute>
          } />
          <Route path="/myorders" element={
            <ProtectedRoute>
              <UserOrders />
            </ProtectedRoute>
          } />
          <Route path="/adminorder" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/createlisting" element={
            <ProtectedRoute requireAdmin={true}>
              <CreateListing />
            </ProtectedRoute>
          } />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/editproduct/:id" element={<EditProduct />} />
          <Route path="*" element={<ErrorMessage notFound={true} />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
