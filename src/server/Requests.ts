import { apiClient } from "@/lib/ApiClient";
import axiosInstance from "@/lib/axios";

export const createBookingRequest = async (data: any) => {
  // createBookingRequest is intentionally not implemented — handled by client socket flow
  console.log("data----booking---", data);
};

export const getAllPendingRequest = async () => {
  try {
    const result = await apiClient.get("/admin/requests?status=PENDING");
    return result.data || [];
  } catch (error: any) {
    throw { message: error.message };
  }
};

export const getUserPendingRequest = async (userId: string) => {
  try {
    const result = await axiosInstance.get(`/requests/users/${userId}?status=PENDING`);
    return result.data?.data || result.data || [];
  } catch (error: any) {
    throw { message: error.message };
  }
};

export const findRequest = async (id: string) => {
  try {
    const result = await apiClient.get(`/admin/requests/${id}`);
    return result.data;
  } catch (error: any) {
    return null;
  }
};

export const updateRequest = async (id: string, data: any) => {
  try {
    const result = await axiosInstance.patch(`/requests/${id}`, data);
    return result.data?.data || result.data;
  } catch (error: any) {
    throw { message: error.message };
  }
};
