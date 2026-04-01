import { apiClient } from "@/lib/ApiClient";

const getUserTransactions = async (userId: string) => {
  try {
    const result = await apiClient.get(`/payment-transaction/transactions/${userId}`);
    return { statusCode: 200, data: result.data || [] };
  } catch (err: any) {
    console.log(err);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

const getUsersTransactions = async () => {
  try {
    const result = await apiClient.get("/payment-transaction/admin/users");
    return { statusCode: 200, data: result.data || [] };
  } catch (err: any) {
    console.log(err);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

const getAllWithdrawalRequests = async () => {
  try {
    const result = await apiClient.get("/payment-transaction/admin/withdrawals");
    return { statusCode: 200, data: result.data || [] };
  } catch (err: any) {
    console.log(err);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

const rejectWithdrawalRequest = async (id: string, proceededBy: string) => {
  try {
    await apiClient.patch(`/payment-transaction/admin/withdrawals/${id}/reject`, { proceededBy });
    return { statusCode: 200, message: "Request Rejected successfully." };
  } catch (err: any) {
    console.log(err);
    return { statusCode: 500, message: err.message || "Internal Server Error" };
  }
};

const processWithdrawalRequest = async (id: string, proceededBy: string) => {
  try {
    await apiClient.patch(`/payment-transaction/admin/withdrawals/${id}/process`, { proceededBy });
    return { statusCode: 200, message: "Request Processed successfully." };
  } catch (err: any) {
    console.log(err);
    return { statusCode: 500, message: err.message || "Internal Server Error" };
  }
};

export {
  getUserTransactions,
  getAllWithdrawalRequests,
  rejectWithdrawalRequest,
  processWithdrawalRequest,
  getUsersTransactions,
};
