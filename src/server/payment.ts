import { apiClient } from "@/lib/ApiClient";
import { ITransaction } from "@/types/type";

export async function createPaymentRequest(
  recipientId: string,
  payeeId: string,
  amount: number,
  onAccountOf: string,
  remarks?: string
) {
  try {
    const result = await apiClient.post("/payment-transaction/request", {
      recipientId, payeeId, amount, onAccountOf, remarks,
    });
    return result.data;
  } catch (error) {
    console.error("Error creating payment request:", error);
    throw new Error("Unable to create payment request");
  }
}

export async function rejectPaymentRequest(paymentRequestId: string) {
  try {
    const result = await apiClient.patch(`/payment-transaction/request/${paymentRequestId}/decline`);
    return { data: result.data, statusCode: 200 };
  } catch (err: any) {
    return { message: err.message, statusCode: 400 };
  }
}

export async function processPayment(paymentRequestId: string) {
  try {
    const result = await apiClient.patch(`/payment-transaction/request/${paymentRequestId}/confirm`);
    return { data: result.data, statusCode: 200 };
  } catch (err: any) {
    return { message: err.message, statusCode: 400 };
  }
}

export async function paymentTransfer(
  recipientId: string,
  payeeId: string,
  amount: number,
  narration: string
) {
  try {
    const result = await apiClient.post("/payment-transaction/transfer", {
      recipientId, payeeId, amount, narration,
    });
    return { statusCode: 200, message: "Payment Transfer Successful.", data: result.data };
  } catch (err: any) {
    return { message: err.message, statusCode: 400 };
  }
}

export const TopupWallet = async (userId: string, amount: number, stripeId: string) => {
  const result = await apiClient.post<ITransaction>("/payment-transaction/transaction", {
    userId, amount, stripeId, type: "TOPUP",
  });
  return result.data;
};

export const bookingTransaction = async (userId: string, amount: number, bookingId: string) => {
  try {
    const result = await apiClient.post("/payment-transaction/transaction", {
      userId, amount: -amount, bookingId, type: "EXPENSE",
    });
    return { statusCode: 200, message: "Transaction Successful" };
  } catch (err: any) {
    return { message: err.message, statusCode: 400 };
  }
};

export const bookingTransactionRefund = async (userId: string, amount: number, bookingId: string) => {
  try {
    const result = await apiClient.post("/payment-transaction/transaction", {
      userId, amount, bookingId, type: "REFUND",
    });
    return { statusCode: 200, message: "Transaction Successful" };
  } catch (err: any) {
    return { message: err.message, statusCode: 400 };
  }
};

export const getAllUserTransactions = async (userId: string) => {
  const result = await apiClient.get(`/payment-transaction/transactions/${userId}`);
  return result.data || [];
};

export const getAllWithdrawalRequests = async (userId: string) => {
  const result = await apiClient.get(`/payment-transaction/withdraws/${userId}`);
  return result.data || [];
};

export const getAllReceivePaymentRequests = async (userId: string) => {
  try {
    const result = await apiClient.get(`/payment-transaction/requests/received/${userId}`);
    return result.data || [];
  } catch (err) {
    return null;
  }
};

export const getAllSendPaymentRequests = async (userId: string) => {
  try {
    const result = await apiClient.get(`/payment-transaction/requests/sent/${userId}`);
    return result.data || [];
  } catch (err) {
    return null;
  }
};

export const getAllWithDrawlRequests = async (userId: string) => {
  const result = await apiClient.get(`/payment-transaction/withdraws/${userId}`);
  return result.data || [];
};

export const getUserWallet = async (userId: string) => {
  try {
    const result = await apiClient.get(`/payment-transaction/wallets/${userId}`);
    if (!result.data) return { message: "Wallet not found", statusCode: 404 };
    return result.data;
  } catch (error) {
    return { message: "Internal Server Error", statusCode: 500 };
  }
};

export const updateUserWallet = async (userId: string, amount: number) => {
  try {
    await apiClient.patch(`/payment-transaction/wallets/${userId}`, { amount });
    return { message: "Wallet updated", statusCode: 200 };
  } catch (error) {
    return { message: "Internal Server Error", statusCode: 500 };
  }
};

export const createTransaction = async ({
  userId, amount, type, withdrawRequestId, paymentRequestId,
  bookingId, senderId, receiverId, narration, stripeId,
}: {
  userId: string; amount: number; type: string; withdrawRequestId?: string;
  paymentRequestId?: string; bookingId?: string; senderId?: string;
  receiverId?: string; narration?: string; stripeId?: string;
}) => {
  try {
    const result = await apiClient.post("/payment-transaction/transaction", {
      userId, amount, type, withdrawRequestId, paymentRequestId,
      bookingId, senderId, receiverId, narration, stripeId,
    });
    return { statusCode: 200, transaction: result.data };
  } catch (error) {
    return { message: "Internal Server Error", statusCode: 500 };
  }
};
