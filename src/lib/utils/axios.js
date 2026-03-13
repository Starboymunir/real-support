import axios from 'axios';
// config
import { HOST_API } from '@/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: '' });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || 'Something went wrong'
    )
);

export default axiosInstance;
// ----------------------------------------------------------------------

export const endpoints = {
  admin: {
    getAll: "/api/admin/adminUsers",
    login: '/api/admin/login',
    register: '/api/admin/adminUsers/register',
    userValidation: '/api/admin/adminUsers/user-validation',
    verifyOtp: '/api/admin/adminUsers/verify-code',
    changePassword: '/api/admin/adminUsers/change-password',
  },
  passengers: {
    allPassengers: '/api/admin/passengers/',
    byId: (id) => `/api/admin/passengers/${id}`,
    update: (id) => `/api/admin/passengers/${id}`,
    delete: (id) => `/api/admin/passengers/${id}`,
  },
  drivers: {
    allDrivers: '/api/admin/drivers/',
    byId: (id) => `/api/admin/drivers/${id}`,
    update: (id) => `/api/admin/drivers/${id}`,
    delete: (id) => `/api/admin/drivers/${id}`,
    updateDoc: (driverId=null,documentId) => `/api/admin/drivers/${driverId}/documents/${documentId}`,
  },
  documents: {
    doc: (id) => `/api/admin/files/${id}/`,
    byId: (driverId, id) => `/api/admin/drivers/${driverId}/documents/`,
  },
  cars: {
    byId: (driverId, id) => `/api/admin/drivers/${driverId}/cars/${id}/`,
    update: (driverId, id) => `/api/admin/drivers/${driverId}/cars/${id}/`,
    carDocUpdate: (driverId, id) => `/api/admin/drivers/${driverId}/cars/documents/${id}`
  },
  bookings: {
    allBookings: '/api/admin/bookings',
  },
  packages: {
    allPackages: '/api/admin/packages',
    byId: (id) => `/api/admin/packages/${id}`,
    update: (id) => `/api/admin/packages/${id}`,
    delete: (id) => `/api/admin/packages/${id}`,
  },
};
