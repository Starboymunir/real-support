import { apiClient } from "@/lib/ApiClient";

interface WithdrawalResponse {
  statusCode: number;
  withdrawal?: any;
  message?: string;
}

export const getAllWithdrawals = async () => {
  try {
    const result = await apiClient.get("/payment-transaction/admin/withdrawals");
    return { statusCode: 200, data: result.data || [] };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

export const getWithdrawalRequestById = async (
  id: string
): Promise<WithdrawalResponse> => {
  try {
    const result = await apiClient.get(`/payment-transaction/admin/withdrawals/${id}`);
    const withdrawal = result.data;

    if (!withdrawal) {
      return { statusCode: 404, message: "Withdrawal request not found" };
    }

    return { statusCode: 200, withdrawal };
  } catch (err) {
    console.error("Error fetching withdrawal request:", err); // Provide more context in logs
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

export const updateWithdrawalRequestStatus = async (
  id: string,
  status: string,
  proceededBy: string
) => {
  try {
    const existing = await apiClient.get(`/payment-transaction/admin/withdrawals/${id}`);
    const withdrawal = existing.data;

    if (!withdrawal) {
      return { statusCode: 404, message: "Withdrawal request not found" };
    }

    if (status === "REJECTED") {
      await apiClient.patch(`/payment-transaction/admin/withdrawals/${id}/reject`, {
        proceededBy,
      });
    } else {
      await apiClient.patch(`/payment-transaction/admin/withdrawals/${id}/process`, {
        proceededBy,
      });
    }

    return { statusCode: 200, message: "Withdrawal request updated" };
  } catch (err) {
    console.error("Error updating withdrawal request status:", err);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};
