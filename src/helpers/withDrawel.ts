"use server";
import prisma from "@/database/prisma";
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
  const withdrawRequest = await prisma.withdrawRequests.create({
    data: {
      userId,
      amount,
      status: "PENDING",
    },
  });

  if (!withdrawRequest) {
    return {
      message: "Internal Server Error",
      type: "Internal Server Error",
      statusCode: 500,
    };
  }

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });

  return {
    data: withdrawRequest,
    message: "withdrawal request created",
    statusCode: 200,
  };
}
