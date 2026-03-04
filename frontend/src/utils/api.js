import axios from 'axios';

// Base URL for your backend API
const API_URL = 'http://localhost:5000/api'; // Change this to your backend URL

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication APIs
export const register = (userData) => api.post('/register', userData);
export const login = (userData) => api.post('/login', userData);
export const getDocuments = () => api.get('/documents');

export default api;