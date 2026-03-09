"use server";
import prisma from "@/database/prisma";

const getAllAdminTransaction = async () => {
  return await prisma.adminTransaction.findMany({
    include: {
      userInfo: true,
    },
  });
};

const createAdminTransaction = async (userId: string, amount: number, type: string) => {
  try {
    const userWallet = await prisma.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!userWallet) {
        return {statusCode:400,message:"user not found"}
    }
    const newAdminTransaction = await prisma.adminTransaction.create({
      data: {
        userId,
        amount,
        type: type == "SEND" ? "EXPENSE" : "INCOME",
      },
    });

    const newUserTransaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: type == "SEND" ? "ADMIN_FUND" : "ADMIN_CHARGE",
      },
    });
    const balance =
      type == "SEND"
        ? Number(userWallet.balance) + Number(amount)
        : Number(userWallet.balance) - Number(amount);
    await prisma.wallet.update({
      where: {
        userId,
      },
      data: {
        balance: balance,
      },
    });

    return {statusCode:200,message:"Tranasacition Successfull"}
  } catch (err) {
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

export { getAllAdminTransaction, createAdminTransaction };
