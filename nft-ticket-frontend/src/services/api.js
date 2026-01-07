import axios from 'axios';

// Backend URL
const API_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  // Check for admin, developer, or user token (in priority order)
  const adminToken = localStorage.getItem('adminToken');
  const developerToken = localStorage.getItem('developerToken');
  const userToken = localStorage.getItem('token');

  const token = adminToken || developerToken || userToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs (original user auth)
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  connectWallet: (walletAddress) => api.post('/auth/connect-wallet', { walletAddress }),
};

// Event APIs
export const eventAPI = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
};

// Ticket APIs
export const ticketAPI = {
  purchase: (eventId) => api.post('/tickets/purchase', { eventId }),
  getMyTickets: () => api.get('/tickets/my-tickets'),
  verify: (tokenId) => api.get(`/tickets/verify/${tokenId}`),
  transfer: (ticketId, toAddress) => api.post('/tickets/transfer', { ticketId, toAddress }),
  syncTransfer: (ticketId, toAddress) => api.post('/tickets/sync-transfer', { ticketId, toAddress }),
};

// Admin APIs
export const adminAPI = {
  register: (data) => api.post('/admin/register', data),
  login: (data) => api.post('/admin/login', data),
  getEvents: () => api.get('/admin/events'),
  createEvent: (data) => api.post('/admin/events', data),
  updateEvent: (id, data) => api.put(`/admin/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),
  getDevelopers: () => api.get('/admin/developers'),
  getUsageLogs: () => api.get('/admin/usage-logs'),
};

// Developer Portal APIs
export const developerAPI = {
  register: (data) => api.post('/developers/register', data),
  login: (data) => api.post('/developers/login', data),
  getProfile: () => api.get('/developers/me'),
  regenerateKey: () => api.post('/developers/regenerate-key'),
  getUsage: () => api.get('/developers/usage'),
};

export default api;
