"use server";
import { Wallet } from '@prisma/client';
import prisma from '@/database/prisma';

export async function getWallet(userId: string): Promise<Wallet> {

  const wallet = await prisma.wallet.findUnique({ where: { userId } });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  return wallet;
}

export async function createWallet(userId: string): Promise<void> {
  const existingWallet = await prisma.wallet.findUnique({ where: { userId } });
  if (existingWallet) {
    throw new Error('Wallet already exists for this user');
  }

  await prisma.wallet.create({
    data: {
      userId,
      balance: 0, // Initial balance is zero
    },
  });
}

