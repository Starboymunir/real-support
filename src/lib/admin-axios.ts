// lib/admin-axios.ts
// Axios instance for admin panel — authenticates with rs_token (JWT from admin login)
import axios from 'axios';
import { getToken } from './api';

const baseURL = `${process.env.NEXT_PUBLIC_BACKEND_API}/api`;

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
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || 'Something went wrong',
    ),
);

export default adminAxios;
