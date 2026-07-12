import axios from 'axios';

/**
 * Axios Instance — AssetFlow API Client
 * ======================================
 * Base URL: configure via .env → VITE_API_BASE_URL
 * Default: http://localhost:8000/api
 *
 * Backend team: ensure CORS allows the frontend origin.
 * JWT token is auto-attached via request interceptor.
 */

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ---- Request Interceptor: Attach JWT ----
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('af_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor: Handle 401 ----
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear auth and redirect to login
      localStorage.removeItem('af_token');
      localStorage.removeItem('af_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
