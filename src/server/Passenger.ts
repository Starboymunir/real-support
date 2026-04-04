import { apiClient } from "@/lib/ApiClient";

const getAllPassengers = async () => {
  try {
    const result = await apiClient.get("/admin/passengers");
    return result.data || [];
  } catch (error) {
    console.log("Error in getAllPassengerFunction", error);
    throw { message: error.message };
  }
};

const allowGenerateInvoice = async (id, status) => {
  try {
    await apiClient.patch(`/admin/bookings/${id}`, { isAllowGenerateInvoice: status });
    return { statusCode: 200, message: "Invoice generation updated successfully" };
  } catch (err) {
    return { statusCode: 400, message: err.message };
  }
};

const getPassengerById = async (id) => {
  try {
    const result = await apiClient.get(`/admin/passengers/${id}`);
    return result.data;
  } catch (error) {
    throw { message: error.message };
  }
};

const updatePassengerById = async (id, data) => {
  try {
    const result = await apiClient.patch(`/admin/passengers/${id}`, data);
    return result.data;
  } catch (error) {
    throw { message: error.message };
  }
};

const changeStatus = async (id, status) => {
  try {
    const result = await apiClient.patch(`/admin/passengers/${id}/status`, { status });
    return { data: result.data, statusCode: 200 };
  } catch (error) {
    return { message: error.message, statusCode: 400 };
  }
};

const promoteUserToAdmin = async (id) => {
  try {
    const result = await apiClient.post("/admin/passengers/promote-user", { userId: id });
    return { data: result.data, statusCode: 200 };
  } catch (error) {
    console.error(error);
    return { message: error.message, statusCode: 400 };
  }
};

export {
  getAllPassengers,
  updatePassengerById,
  getPassengerById,
  changeStatus,
  allowGenerateInvoice,
  promoteUserToAdmin,
};
