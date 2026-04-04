import { apiClient } from "@/lib/ApiClient";

export const activatePackage = async (id: string) => {
  try {
    const result = await apiClient.patch(`/packages/${id}`, { status: true });
    return { message: "Package activated successfully", data: result.data };
  } catch (err: any) {
    throw { message: err.message };
  }
};

export const deactivatePackage = async (id: string) => {
  try {
    const result = await apiClient.patch(`/packages/${id}`, { status: false });
    return { message: "Package deactivated successfully", data: result.data };
  } catch (err: any) {
    throw { message: err.message };
  }
};

export const getPacketById = async (id: string) => {
  try {
    const result = await apiClient.get(`/admin/packages/${id}`);
    return result.data;
  } catch (error: any) {
    throw { message: error.message };
  }
};
