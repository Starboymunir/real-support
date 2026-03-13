// "use server";
import { findDriverCar } from "@/app/api/helpers/driver/driver";
import prisma from '@/database/prisma';
import axios from "axios";
// import { revalidatePath } from "next/cache";
import { toast } from "sonner";
import axiosInstance from "../axios";

export const createEditDocuments = async (
  documentType: string,
  data: FormData
) => {

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

export const createEditCarDocuments = async (
  documentType: string,
  data: FormData
) => {
  const response = await axios.post(
    `/api/users/auth/register/driver/car/documents/${documentType}`,
    data
  );
  toast.success("Document upload successfully");
  return response;
};
export const updateDriverProfile = async (id: string, data: FormData) => {
  const response = await axios.put(
    `/api/users/auth/register/driver/${id}`,
    data
  );
  return response;
};

export const createCar = async (data: FormData) => {
  const response = await axiosInstance.post(
    `/driver-cars`,
    data
  );
  return response;
};

export const updateCar = async (id: string, data: FormData) => {
  const response = await axios.put(`/api/users/driver/car/${id}/`, data);
  return response;
};

export const getCarByDriver = async (driverId: string) => {
  try {
    const car = await findDriverCar(driverId);
    return car;
  } catch (err) {
    return null;
  }
};
export const getDocumentByDriver = async (driverId: string) => {
  try {
    const response = await prisma.document.findUnique({ where: { driverId } });
    return response;
  } catch (err) {
    return null;
  }
};
export const getCarDocumentByCar = async (carId: string) => {
  try {
    const response = await prisma.carDocument.findUnique({ where: { carId } });
    return response;
  } catch (err) {
    // console.log("Error", err);
    return null;
  }
};
