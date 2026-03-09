"use server";

import { findPackage } from "@/app/api/helpers/package";
import prisma from "@/database/prisma";

export const activatePackage = async (id: string) => {
  try {
    const packageExist = await findPackage(id);
    if (!packageExist) {
      throw { message: "Package Not Exit" };
    }
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        status: true,
      },
    });
    return { message: "Package active successfully", data: updatedPackage };
  } catch (err: any) {
    throw { message: err.message };
  }
};

export const getPacketById = async (id: string) => {
  try {
    const result = await prisma.package.findUnique({
      where: { id },
    });

    return result;
  } catch (error: any) {
    throw { message: error.message };
  }
};
