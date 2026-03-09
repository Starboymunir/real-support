"use server";

import prisma from "@/database/prisma";
import {
  getWithdrawalRequestById,
  updateWithdrawalRequestStatus,
} from "./withdrawals";
import { createTransaction, getUserWallet, updateUserWallet } from "./payment";

const getUserTransactions = async (userId: string) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      include: {
        senderInfo: true,
        userInfo: true,
        receiverInfo: true,
      },
    });

    return { statusCode: 200, data: transactions };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

const getUsersTransactions = async () => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        senderInfo: true,
        userInfo: true,
        receiverInfo: true,
      },
    });

    return { statusCode: 200, data: transactions };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

const getAllWithdrawalRequests = async () => {
  console.log("withdrawal");

  try {
    const requests = await prisma.withdrawRequests.findMany({
      include: {
        userInfo: {
          include: {
            wallet: true,
          },
        },
        proceeder: {
          include: {
            userProfile: true,
          },
        },
      },
    });
    console.log(requests, "requests");
    return { statusCode: 200, data: requests };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

const rejectWithdrawalRequest = async (id: string, proceededBy: string) => {
  try {
    const { message, withdrawal } = await getWithdrawalRequestById(id);

    if (!withdrawal) {
      return { message };
    }

    if (withdrawal.status !== "PENDING") {
      return {
        message: `Request is already ${withdrawal.status.toLowerCase()}`,
      };
    }

    const updatedRequest = await updateWithdrawalRequestStatus(
      withdrawal.id,
      "REJECTED",
      proceededBy
    );

    if (updatedRequest.statusCode !== 200) {
      return { message };
    }

    const wallet = await getUserWallet(withdrawal.userId);

    if (!wallet) {
      return { message: "Wallet not found" };
    }

    await updateUserWallet(withdrawal.userId, withdrawal.amount);

    return {
      statusCode: 200,
      message: `Request Reject  successfully.`,
    };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

const processWithdrawalRequest = async (id: string, proceededBy: string) => {
  try {
    const { message, withdrawal } = await getWithdrawalRequestById(id);

    if (!withdrawal) {
      return { message };
    }

    if (withdrawal.status !== "PENDING") {
      return {
        message: `Request is already ${withdrawal.status.toLowerCase()}`,
      };
    }

    const wallet = await getUserWallet(withdrawal.userId);

    if (!wallet) {
      return { message: "Wallet not found" };
    }

    const updatedRequest = await updateWithdrawalRequestStatus(
      withdrawal.id,
      "PROCESSED",
      proceededBy
    );

    if (updatedRequest.statusCode !== 200) {
      return { message };
    }

    await createTransaction({
      userId: withdrawal.userId,
      amount: -withdrawal.amount,
      type: "WITHDRAW",
      withdrawRequestId: withdrawal.id,
    });

    return {
      statusCode: 200,
      message: `Request Processed successfully.`,
    };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

export {
  getUserTransactions,
  getAllWithdrawalRequests,
  rejectWithdrawalRequest,
  processWithdrawalRequest,
  getUsersTransactions,
};
