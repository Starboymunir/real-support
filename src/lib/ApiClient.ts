/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from "@/types/type";
import axiosInstance from "./admin-axios";


export const apiClient = {
  get: async <T>(url: string, config?: object) => {
    const res = await axiosInstance.get<ApiResponse<T>>(url, config);
    return res.data;
  },

  post: async <T>(url: string, body?: any, config?: object) => {
    const res = await axiosInstance.post<ApiResponse<T>>(url, body, config);
    return res.data;
  },

  put: async <T>(url: string, body?: any, config?: object) => {
    const res = await axiosInstance.put<ApiResponse<T>>(url, body, config);
    return res.data;
  },

  patch: async <T>(url: string, body?: any, config?: object) => {
    const res = await axiosInstance.patch<ApiResponse<T>>(url, body, config);
    return res.data;
  },

  delete: async <T>(url: string, config?: object) => {
    const res = await axiosInstance.delete<ApiResponse<T>>(url, config);
    return res.data;
  },
};