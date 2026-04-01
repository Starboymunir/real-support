import axios from "axios";
import { toast } from "sonner";
import axiosInstance from "../axios";
import { apiClient } from "@/lib/ApiClient";

export const createEditDocuments = async (documentType: string, data: FormData) => {
  try {
    const response = await axios.post(
      `/api/users/auth/register/driver/documents/${documentType}`,
      data
    );
    toast.success("Document upload successfully");
    return response;
  } catch (err) {
    throw new Error((err as Error).message);
  }
};

export const createEditCarDocuments = async (documentType: string, data: FormData) => {
  const response = await axios.post(
    `/api/users/auth/register/driver/car/documents/${documentType}`,
    data
  );
  toast.success("Document upload successfully");
  return response;
};

export const updateDriverProfile = async (id: string, data: FormData) => {
  const response = await axios.put(`/api/users/auth/register/driver/${id}`, data);
  return response;
};

export const createCar = async (data: FormData) => {
  const response = await axiosInstance.post(`/driver-cars`, data);
  return response;
};

export const updateCar = async (id: string, data: FormData) => {
  const response = await axios.put(`/api/users/driver/car/${id}/`, data);
  return response;
};

export const getCarByDriver = async (driverId: string) => {
  try {
    const res = await apiClient.get(`/driver-cars?driverId=${driverId}`);
    const cars = res.data;
    return Array.isArray(cars) ? cars[0] || null : cars;
  } catch (err) {
    return null;
  }
};

export const getDocumentByDriver = async (driverId: string) => {
  try {
    const result = await apiClient.get(`/documents/driver/${driverId}`);
    return result.data;
  } catch (err) {
    return null;
  }
};

export const getCarDocumentByCar = async (carId: string) => {
  try {
    const result = await apiClient.get(`/documents/car/${carId}`);
    return result.data;
  } catch (err) {
    return null;
  }
};
