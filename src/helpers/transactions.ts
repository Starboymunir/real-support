import prisma from "@/database/prisma";

import { getWallet } from "./wallet"; // Import wallet-related functions
import { Payment, TransactionType } from "@prisma/client";

export async function performTransaction({
  userId,
  amount,
  senderId,
  stripeId,
  type,
  narration,
  paymentRequestId,
  receiverId,
  bookingId,
  paymentsDetail,
}: {
  userId: string;
  amount: number;
  type: TransactionType;
  paymentRequestId?: string;
  stripeId?: string;
  narration?: string;
  senderId?: string;
  receiverId?: string;
  bookingId?: string;
  paymentsDetail?: Payment[];
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }
  const wallet = await getWallet(userId);
  const newBalance = wallet.balance + amount;
  if (newBalance < 0) {
    throw new Error("Insufficient balance");
  }
  await prisma.wallet.update({
    where: { userId },
    data: { balance: newBalance },
  });

  // Create transaction record
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      amount,
      type,
      paymentRequestId,
      senderId,
      stripeId,
      narration,
      bookingId,
      walletId: wallet.id,
      receiverId,
      // paymentsDetail,
    },
  });

  return transaction;
}
