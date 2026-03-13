"use server";

import { uploadFile as ImageUploadHelper } from "@/app/api/helpers/imageUpload";
import { convertFormData } from "@/app/api/utils/convertFormData";
import prisma from "@/database/prisma";
import { UserStatus } from "@prisma/client";
import { remove } from "aws-amplify/storage";
import { revalidatePath } from "next/cache";

const getAllPassengers = async () => {

  try {
    const result = await prisma.user.findMany({
      include: { addresses: true, bookings: true },
    });
    return result;
  } catch (error: any) {
    console.log("Error in getAllPassengerFunction", error);
    throw { message: error.message };
  }
};

const allowGenerateInvoice = async (id: string, status: boolean) => {
  try {
    const result = await prisma.booking.update({
      where: { id },
      data: {
        isAllowGenerateInvoice: status,
      },
    });

    return { statusCode: 200, message: "Generate Invoice Successfully" };
  } catch (err: any) {
    return { statusCode: 400, message: err.message };
  }
};

const getPassengerById = async (id: string) => {
  try {
    const result = await prisma.user.findUnique({
      where: { id },
      include: { addresses: true, bookings: true },
    });

    return result;
  } catch (error: any) {
    throw { message: error.message };
  }
};

const updatePassengerById = async (id: string, data: any) => {
  try {
    const result = await prisma.user.findUnique({
      where: { id },
      include: { addresses: true, bookings: true },
    });

    if (!result) {
      throw { message: "passenger not found" };
    }

    const convertedFormData = convertFormData(data);

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...convertedFormData
      },
    });
    return updatedUser;
  } catch (error: any) {
    throw { message: error.message };
  }
};
const changeStatus = async (id: string, status: UserStatus) => {
  try {
    const result = await prisma.user.findUnique({
      where: { id },
      include: { addresses: true, bookings: true },
    });

    if (!result) {
      return { message: "passenger not found", statusCode: 400 };
    }

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
    revalidatePath("/admin/dashboard/passengers/list/");
    return { data: updatedUser, statusCode: 200 };
  } catch (error: any) {
    return { message: error.message, statusCode: 400 };
  }
};

const promoteUserToAdmin = async (id: string) => {
  try {
    const result = await prisma.user.findUnique({ where: { id } });

    if (!result) {
      return { message: "passenger not found", statusCode: 400 };
    }
    console.log(result);

    const admin = await prisma.admin.create({
      data: {
        userId: id,
        status: true,
      },
    });

    return { data: admin, statusCode: 200 };
  } catch (error: any) {
    console.error(error);
    return { message: error.message, statusCode: 400 };
  }
};

export {
  getAllPassengers,
  updatePassengerById,
  getPassengerById,
  changeStatus,
  allowGenerateInvoice,
  promoteUserToAdmin,
};
