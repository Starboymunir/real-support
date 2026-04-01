import { apiClient } from "@/lib/ApiClient";

const getAllAdminTransaction = async () => {
  const result = await apiClient.get("/payment-transaction/admin");
  return result.data || [];
};

const createAdminTransaction = async (userId: string, amount: number, type: string) => {
  try {
    await apiClient.post("/payment-transaction/admin/transaction", { userId, amount, type });
    return { statusCode: 200, message: "Transaction Successful" };
  } catch (err: any) {
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

export { getAllAdminTransaction, createAdminTransaction };
