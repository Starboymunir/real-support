"use server";

import prisma from "@/database/prisma";
import { revalidatePath } from "next/cache";

const changeAdminStatus = async (id, status) => {
  try {
    const result = await prisma.Admin.findUnique({
      where: { id },
    });

    if (!result) {
      return { message: "User not found", statusCode: 400 };
    }
    const updatedUser = await prisma.Admin.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    revalidatePath("/admin/dashboard/adminUsers/list/");
    return {
      data: updatedUser,
      message: "user updated successfully",
      statusCode: 200,
    };
  } catch (err) {
    console.log("error", err);
    return {
      message: err.message,
      statusCode: 400,
    };
  }
};

const getAllAdmins = async () => {
  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      status: true,
      userProfile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          emailAddress: true,
          phone_number: true,
          coverImage: true,
        },
      },
    },
  });

  return admins;
};

const deleteAdmin = async (id) => {
  try {
    const user = await prisma.Admin.findUnique({
      where: { id },
    });

    if (!user) {
      return { statusCode: 400, message: "User not found" };
    }

    const deletedUser = await prisma.Admin.delete({
      where: { id },
    });

    revalidatePath("/admin/dashboard/adminUsers/list/");
    return {
      statusCode: 200,
      data: deletedUser,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

export { changeAdminStatus, getAllAdmins, deleteAdmin };
