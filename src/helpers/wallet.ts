import { apiClient } from "@/lib/ApiClient";

export async function getWallet(userId: string) {
  const result = await apiClient.get(`/payment-transaction/wallets/${userId}`);
  if (!result.data) {
    throw new Error("Wallet not found");
  }
  return result.data;
}

export async function createWallet(userId: string): Promise<void> {
  await apiClient.post("/payment-transaction/wallets", { userId, balance: 0 });
}
