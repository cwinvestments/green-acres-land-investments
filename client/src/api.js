import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Check if it's an admin route
  if (config.url.includes('/admin/')) {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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

// Currency formatting helper
export const formatCurrency = (amount) => {
  return parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// States API (Public)
export const getStates = () => api.get('/states');

// States API (Admin)
export const getAdminStates = () => api.get('/admin/states');
export const createState = (stateData) => api.post('/admin/states', stateData);
export const updateState = (id, stateData) => api.patch(`/admin/states/${id}`, stateData);
export const deleteState = (id) => api.delete(`/admin/states/${id}`);

export default api;
