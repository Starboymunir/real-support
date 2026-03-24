// lib/admin-axios.ts
// Axios instance for admin panel — authenticates with rs_token (JWT from admin login)
import axios from 'axios';
import { getToken } from './api';

const _raw = process.env.NEXT_PUBLIC_BACKEND_API ?? 'http://localhost:8000/api';
const baseURL = _raw.endsWith('/api') ? _raw : `${_raw.replace(/\/$/, '')}/api`;

const adminAxios = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminAxios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminAxios.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error.response?.data;
    const msg = typeof data === 'object' && data?.message
      ? data.message
      : typeof data === 'string'
        ? data
        : error.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  },
);

export default adminAxios;
