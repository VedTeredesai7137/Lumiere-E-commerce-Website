import React from 'react';
import '../App.css';
const isAuthError = (error) => {
  if (!error) return false;
  const msg = (typeof error === 'string' ? error : error.message || '').toLowerCase();
  return (
    msg.includes('password') ||
    msg.includes('username') ||
    msg.includes('user not found') ||
    msg.includes('invalid password') ||
    msg.includes('invalid credentials')
  );
};

const ErrorMessage = ({ error, notFound }) => {
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">URL is invalid</h1>
          <p className="text-gray-700 mb-4">
            The page you are looking for does not exist or the URL is incorrect.
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-2 bg-orange-400 text-white rounded-full font-medium hover:bg-orange-500 transition"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }
  if (!error) return null;
  if (isAuthError(error)) {
    // Show the actual error for authentication issues
    return (
      <div className="flex items-center justify-center min-h-[120px]">
        <div className="bg-white border border-red-200 rounded-lg shadow p-4 text-center max-w-md">
          <h2 className="text-lg font-bold text-red-600 mb-2">{typeof error === 'string' ? error : error.message}</h2>
        </div>
      </div>
    );
  }
  // For all other errors, show a generic message only
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="bg-white border border-red-200 rounded-lg shadow p-6 text-center max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-2">Sorry, some issue is going on.</h2>
        <p className="text-gray-700 mb-2">
          We are trying our best to solve it. Please try again later or refresh the page.
        </p>
      </div>
    </div>
  );
};

export default ErrorMessage; 