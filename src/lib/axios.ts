// lib/axios.ts
import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const baseURL = `${process.env.NEXT_PUBLIC_BACKEND_API}/api`;

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (token) {
    // @ts-ignore
    config.headers = {
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    console.log(error, 'error from axios');
    return Promise.reject((error.response && error.response.data) || 'Something went wrong');
  }
);

export default axiosInstance;