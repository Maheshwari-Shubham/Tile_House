import axios from 'axios';

// Use environment variable for API URL; default to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL
});

// Attach correct token — admin and user routes sometimes overlap
API.interceptors.request.use((config) => {
  const userToken  = localStorage.getItem('userToken');
  const adminToken = localStorage.getItem('adminToken');
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  const isUserRoute = url.startsWith('/users') || url.includes('/orders/mine');
  const isAdminRoute =
    url.startsWith('/admin') ||
    (url.startsWith('/orders') && !url.includes('/orders/mine')) ||
    (url.startsWith('/offers') && !url.includes('/offers/active')) ||
    (url.startsWith('/settings') && (url === '/settings/full' || url === '/settings/test-email' || ['post', 'put', 'delete'].includes(method))) ||
    ((url.startsWith('/products') || url.startsWith('/offers') || url.startsWith('/orders')) && ['post', 'put', 'delete'].includes(method));

  if (isUserRoute && userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
    return config;
  }

  if (isAdminRoute && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
    return config;
  }

  if (!isAdminRoute && userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
    return config;
  }

  if (!isUserRoute && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  return config;
});

// Products
export const getProducts        = (params) => API.get('/products', { params });
export const getFeaturedProducts= () => API.get('/products/featured');
export const getProduct         = (id) => API.get(`/products/${id}`);
export const createProduct      = (data) => API.post('/products', data);
export const updateProduct      = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct      = (id) => API.delete(`/products/${id}`);
// Upload image to Cloudinary via backend — sends multipart/form-data
// Upload image to Cloudinary via backend
export const uploadProductImage = (formData) =>
  API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

// Orders
export const placeOrder         = (data) => API.post('/orders', data);
export const getOrders          = () => API.get('/orders');
export const updateOrderStatus  = (id, data) => API.put(`/orders/${id}`, data);

// Offers
export const getActiveOffers    = () => API.get('/offers/active');
export const validateCoupon     = (code) => API.post('/offers/validate-coupon', { code });
export const getAllOffers        = () => API.get('/offers');
export const createOffer        = (data) => API.post('/offers', data);
export const updateOffer        = (id, data) => API.put(`/offers/${id}`, data);
export const deleteOffer        = (id) => API.delete(`/offers/${id}`);

// Settings
export const getSettings        = () => API.get('/settings');
export const getFullSettings    = () => API.get('/settings/full');
export const updateSetting      = (key, value) => API.put(`/settings/${key}`, { value });
export const testEmail          = () => API.post('/settings/test-email');

// Admin auth
export const adminLogin         = (data) => API.post('/admin/login', data);

// User auth
export const userRegister       = (data) => API.post('/users/register', data);
export const userLogin          = (data) => API.post('/users/login', data);
export const getUserProfile     = () => API.get('/users/profile');
export const updateUserProfile  = (data) => API.put('/users/profile', data);
export const getUserOrders      = () => API.get('/users/orders');

export default API;
export const getMyOrders = () => API.get('/orders/mine');
