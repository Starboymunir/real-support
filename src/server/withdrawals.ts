import prisma from "@/database/prisma";
import { RequestStatus, WithdrawRequests } from "@prisma/client";

interface WithdrawalResponse {
  statusCode: number;
  withdrawal?: WithdrawRequests; // You can replace `any` with the actual type if available
  message?: string;
}

export const getAllWithdrawals = async () => {
  try {
    const withdrawals = await prisma.withdrawRequests.findMany({
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
      orderBy: {
        createdAt: "desc",
      },

      // take: 10,
    });

    return { statusCode: 200, data: withdrawals };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

export const getWithdrawalRequestById = async (
  id: string
): Promise<WithdrawalResponse> => {
  try {
    const withdrawal = await prisma.withdrawRequests.findUnique({
      where: { id },
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

    if (!withdrawal) {
      return { statusCode: 404, message: "Withdrawal request not found" };
    }

    return { statusCode: 200, withdrawal };
  } catch (err) {
    console.error("Error fetching withdrawal request:", err); // Provide more context in logs
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

export const updateWithdrawalRequestStatus = async (
  id: string,
  status: RequestStatus,
  proceededBy: string
) => {
  try {
    const withdrawal = await prisma.withdrawRequests.findUnique({
      where: { id },
    });

    if (!withdrawal) {
      return { statusCode: 404, message: "Withdrawal request not found" };
    }

    await prisma.withdrawRequests.update({
      where: { id },
      data: {
        status,
        proceededBy,
      },
    });

    return { statusCode: 200, message: "Withdrawal request updated" };
  } catch (err) {
    console.error("Error updating withdrawal request status:", err);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};
