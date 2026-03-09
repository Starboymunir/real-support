"use server";
import prisma from "@/database/prisma";

export const getStaticContentByType = async (type) => {
  try {
    const res = await prisma.staticContent.findUnique({
      where: {
        contentType: type,
      },
    });

    if (!res) {
      return { message: "static content not found", statusCode: 400 };
    }
    return { data: res, statusCode: 200 };
  } catch (err) {
    return { message: err.message, statusCode: 400 };
  }
};

export const updateStaticContent = async (id, data) => {
  try {
    const res = await prisma.staticContent.findUnique({
      where: {
        id,
      },
    });

    if (!res) {
      return { message: "static content not found", statusCode: 400  };
    }

    const updatedStaticContent =await  prisma.staticContent.update({
      where: {
        id,
      },
      data,
    });

    return { data: updatedStaticContent, statusCode: 200 };
  } catch (err) {
    return { message: err.message, statusCode: 400 };
  }
};
