import { apiClient } from "@/lib/ApiClient";
import { getWallet } from "./wallet";

export async function createWithdrawRequest(userId: string, amount: number) {
  // Check user's balance
  const wallet = await getWallet(userId);
  const userBalance = wallet.balance;
  if (userBalance < amount) {
    return {
      message: "Insufficient balance",
      type: "Insufficient",
      statusCode: 400,
    };
  }
  const result = await apiClient.post("/payment-transaction/withdraw", {
    userId,
    amount,
  });
  const withdrawRequest = result.data;

  if (!withdrawRequest) {
    return {
      message: "Internal Server Error",
      type: "Internal Server Error",
      statusCode: 500,
    };
  }

  await apiClient.patch(`/payment-transaction/wallets/${userId}`, {
    amount: -amount,
  });

  return {
    data: withdrawRequest,
    message: "withdrawal request created",
    statusCode: 200,
  };
}
