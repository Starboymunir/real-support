"use server";

import { getWallet } from "@/helpers/wallet";
import { performTransaction } from "@/helpers/transactions";
import prisma from "@/database/prisma";
import { TransactionType, Transaction, Wallet } from "@prisma/client";
import { apiClient } from "@/lib/ApiClient";
import { ITransaction } from "@/types/type";

type WalletResponse = Wallet | { message: string; statusCode: number };

interface TransactionResponse {
  statusCode?: number;
  transaction?: Transaction;
  message?: string;
}

interface CreateTransactionInput {
  userId: string;
  amount: number;
  type: TransactionType;
  withdrawRequestId?: string;
  paymentRequestId?: string;
  bookingId?: string;
  senderId?: string;
  receiverId?: string;
  narration?: string;
  stripeId?: string;
}

export async function createPaymentRequest(
  recipientId: string,
  payeeId: string,
  amount: number,
  onAccountOf: string,
  remarks?: string
) {
  try {
    const paymentRequest = await prisma.paymentRequests.create({
      data: {
        recipientId,
        payeeId,
        amount,
        onAccountOf,
        remarks,
        status: "PENDING",
      },
    });

    return paymentRequest;
  } catch (error) {
    console.error("Error creating payment request:", error);
    throw new Error("Unable to create payment request");
  } finally {
    await prisma.$disconnect();
  }
}

export async function rejectPaymentRequest(paymentRequestId: string) {
  try {
    const paymentRequest = await prisma.paymentRequests.findUnique({
      where: { id: paymentRequestId },
    });

    if (
      !paymentRequest ||
      paymentRequest.status === "PROCESSED" ||
      paymentRequest.status === "REJECTED"
    ) {
      return {
        message: "Invalid or unapproved payment request",
        statusCode: 400,
      };
    }

    const updatedPaymentRequest = await prisma.paymentRequests.update({
      where: { id: paymentRequestId },
      data: {
        status: "REJECTED",
      },
    });

    return { data: updatedPaymentRequest, statusCode: 200 };
  } catch (err) {
    return { message: (err as Error).message, statusCode: 400 };
  }
}

export async function processPayment(paymentRequestId: string) {
  try {
    const paymentRequest = await prisma.paymentRequests.findUnique({
      where: { id: paymentRequestId },
    });

    if (
      !paymentRequest ||
      paymentRequest.status === "PROCESSED" ||
      paymentRequest.status === "REJECTED"
    ) {
      return {
        message: "Invalid or unapproved payment request",
        statusCode: 400,
      };
    }

    const payeeId = paymentRequest.payeeId;
    const payeeBalance = await getWallet(payeeId);

    if (payeeBalance.balance < paymentRequest.amount) {
      return { message: "Insufficient balance", statusCode: 400 };
    }

    await performTransaction({
      userId: payeeId,
      amount: -paymentRequest.amount,
      type: "REQUEST",
      paymentRequestId,
    });

    await performTransaction({
      userId: paymentRequest.recipientId,
      senderId: paymentRequest.payeeId,
      amount: paymentRequest.amount,
      type: "REQUEST",
      paymentRequestId,
    });

    const updatedPaymentRequest = await prisma.paymentRequests.update({
      where: { id: paymentRequestId },
      data: {
        status: "PROCESSED",
      },
    });

    return { data: updatedPaymentRequest, statusCode: 200 };
  } catch (err) {
    return { message: (err as Error).message, statusCode: 400 };
  }
}

export async function paymentTransfer(
  recipientId: string,
  payeeId: string,
  amount: number,
  narration: string
) {
  const wallet = await getWallet(payeeId);

  if (wallet.balance < amount) {
    return { message: "Insufficient balance", statusCode: 400 };
  }

  await performTransaction({
    userId: recipientId,
    senderId: payeeId,
    narration,
    amount: amount,
    type: "P2P_WALLET",
  });

  await performTransaction({
    userId: payeeId,
    receiverId: recipientId,
    amount: -amount,
    narration,
    type: "P2P_WALLET",
  });

  return { statusCode: 200, message: "Payment Transafer Successful." };
}

export const TopupWallet = async (
  userId: string,
  amount: number,
  stripeId: string
) => {
  const result = await apiClient.post<ITransaction>(
    "/payment-transaction/transaction",
    {
      userId,
      amount,
      stripeId,
      type: "TOPUP",
    }
  );
  return result.data;
};

export const bookingTransaction = async (
  userId: string,
  amount: number,
  bookingId: string
) => {
  const wallet = await getWallet(userId);

  if (wallet.balance < amount) {
    return { message: "Insufficient balance", statusCode: 400 };
  }

  await prisma.wallet.update({
    where: { userId },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });

  await prisma.transaction.create({
    data: {
      userId,
      amount: -amount,
      bookingId,
      type: "EXPENSE",
      walletId: wallet.id,
    },
  });
  return { statusCode: 200, message: "Transaction Successful" };
};

export const bookingTransactionRefund = async (
  userId: string,
  amount: number,
  bookingId: string
) => {
  const wallet = await getWallet(userId);

  if (!wallet) {
    return { message: "Wallet not found", statusCode: 400 };
  }

  await prisma.wallet.update({
    where: { userId },
    data: {
      balance: {
        increment: amount,
      },
    },
  });

  await prisma.transaction.create({
    data: {
      userId,
      amount: amount,
      bookingId,
      type: "REFUND",
      walletId: wallet.id,
    },
  });
  return { statusCode: 200, message: "Transaction Successful" };
};

export const getAllUserTransactions = async (userId: string) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
    },
    include: { senderInfo: true, receiverInfo: true },
    orderBy: { createdAt: "desc" },
  });
  return transactions;
};

export const getAllWithdrawalRequests = async (userId: string) => {
  const requests = await prisma.withdrawRequests.findMany({
    where: {
      userId,
    },
    orderBy: { createdAt: "desc" },
  });
  return requests;
};

export const getAllReceivePaymentRequests = async (userId: string) => {
  console.log("UserId++++++++", userId);

  try {
    const requests = prisma.paymentRequests.findMany({
      where: {
        payeeId: userId,
      },
      include: {
        recipient: true,
      },
    });

    console.log("Requests", requests);

    return requests;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const getAllSendPaymentRequests = async (userId: string) => {
  try {
    const requests = prisma.paymentRequests.findMany({
      where: {
        recipientId: userId,
      },
      include: {
        payee: true,
      },
    });
    return requests;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const getAllWithDrawlRequests = async (userId: string) => {
  const requests = await prisma.withdrawRequests.findMany({
    where: {
      userId,
    },
  });
  return requests;
};

export const getUserWallet = async (
  userId: string
): Promise<WalletResponse> => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      return { message: "Wallet not found", statusCode: 404 };
    }

    return wallet;
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return { message: "Internal Server Error", statusCode: 500 };
  }
};

export const updateUserWallet = async (userId: string, amount: number) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      return { message: "Wallet not found", statusCode: 404 };
    }

    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    console.log("wallet", wallet);
    console.log("amount", amount);
    console.log("updatedWallet", updatedWallet);

    return { message: "Wallet updated", statusCode: 200 };
  } catch (error) {
    console.error("Error updating wallet:", error);
    return { message: "Internal Server Error", statusCode: 500 };
  }
};

export const createTransaction = async ({
  userId,
  amount,
  type,
  withdrawRequestId,
  paymentRequestId,
  bookingId,
  senderId,
  receiverId,
  narration,
  stripeId,
}: CreateTransactionInput): Promise<TransactionResponse> => {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type,
        withdrawRequestId,
        paymentRequestId,
        bookingId,
        senderId,
        receiverId,
        narration,
        stripeId,
      },
    });

    return { statusCode: 200, transaction };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { message: "Internal Server Error", statusCode: 500 };
  }
};
