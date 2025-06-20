import axios from 'axios';

// API base configuration
const API_BASE_URL = 'http://localhost:8030';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to add common headers
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error: Backend server might not be running');
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL }; 