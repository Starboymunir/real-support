import { apiClient } from "@/lib/ApiClient";

export async function performTransaction(data: {
  userId: string;
  amount: number;
  type: string;
  paymentRequestId?: string;
  stripeId?: string;
  narration?: string;
  senderId?: string;
  receiverId?: string;
  bookingId?: string;
}) {
  const result = await apiClient.post("/payment-transaction/transaction", data);
  return result.data;
}
