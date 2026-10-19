import axios from 'axios';

/**
 * Pre-configured Axios instance for Hommiez REST API
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach Bearer JWT token if user is logged in
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hommiez_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global 401 unauthenticated errors cleanly
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid or expired, clear local storage
      localStorage.removeItem('hommiez_token');
      localStorage.removeItem('hommiez_user');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
