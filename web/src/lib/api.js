import axios from 'axios';
import { getOrCreateUserId } from './session';

// Base URL: Vite proxy handles '/api' -> 'http://localhost:8000'
const baseURL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : '';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: guarantees X-User-Id is attached on every single request
api.interceptors.request.use((config) => {
  const userId = getOrCreateUserId();
  config.headers['X-User-Id'] = userId;
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: formats errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail || error.message;
    console.warn('[API Interceptor Error]:', detail);
    return Promise.reject(error);
  }
);

export default api;

