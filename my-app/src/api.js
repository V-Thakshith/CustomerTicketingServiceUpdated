// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://54.145.172.167:5000/api',
  withCredentials: true,
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');

    // Check if the request URL or method is for login or registration
    const isAuthRequest = config.url.includes('/auth/login') || config.url.includes('/auth/register');
    const isAuthMethod = config.method === 'post' && (config.url === '/auth/login' || config.url === '/auth/register');

    // Only add the Authorization header if it's not a login or registration request and token is available
    if (token && !isAuthRequest && !isAuthMethod) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
