import { apiClient } from "@/lib/ApiClient";
import axiosInstance from "@/lib/axios";

export const findDriverByCognitoId = async (id: string) => {
  try {
    const result = await axiosInstance.get(`/drivers/${id}`);
    return result.data?.data || result.data;
  } catch (err) {
    return null;
  }
};

export const EditWorkPermitDocument = async (driverId: string, data: { workPermitCode: string }) => {
  try {
    const result = await apiClient.post("/documents/work-permit-code", { driverId, workPermitCode: data.workPermitCode });
    return { statusCode: 200, data: result.data, message: "successfully update" };
  } catch (err: any) {
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

export const findDriverById = async (driverId: string) => {
  try {
    const result = await apiClient.get(`/admin/drivers/${driverId}`);
    return result.data;
  } catch (err: any) {
    console.error(err);
    return null;
  }
};

export const createDriver = async (data: any, userId: string, user: string) => {
  try {
    const result = await axiosInstance.post("/drivers/register", {
      ...data,
      driverUserId: user,
    });
    return result.data?.data || result.data;
  } catch (error: any) {
    console.error("[CREATE_DRIVER]", error);
    throw new Error("Internal error");
  }
};
