import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const register = (userData) => api.post('/register', userData);
export const login = (credentials) => api.post('/login', credentials);

// Properties API
export const getProperties = () => api.get('/properties');
export const getProperty = (id) => api.get(`/properties/${id}`);

// Loans API
export const getLoans = () => api.get('/loans');
export const getLoan = (id) => api.get(`/loans/${id}`);
export const createLoan = (loanData) => api.post('/loans', loanData);

// Payments API
export const createPayment = (paymentData) => api.post('/payments', paymentData);
export const getPaymentHistory = (loanId) => api.get(`/loans/${loanId}/payments`);

export default api;
