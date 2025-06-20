import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check sessionStorage for user/admin data
    const userData = sessionStorage.getItem('userData');
    const adminData = sessionStorage.getItem('adminData');
    
    const user = userData ? JSON.parse(userData) : null;
    const admin = adminData ? JSON.parse(adminData) : null;
    
    if (requireAdmin) {
      setIsAdmin(!!admin);
      setIsAuthenticated(!!admin);
    } else {
      setIsAuthenticated(!!user || !!admin);
      setIsAdmin(!!admin);
    }
    
    setIsLoading(false);
  }, [requireAdmin]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl text-gray-600">Loading...</div>
    </div>;
  }

  if (requireAdmin) {
    if (!isAdmin) {
      return <Navigate to="/adminlogin" replace />;
    }
  } else {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 