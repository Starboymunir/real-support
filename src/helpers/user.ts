import { NextResponse } from "next/server";
import prisma from "@/database/prisma";

export const findUserByCognitoId = async (cognitoId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        cognitoId,
      },
      include: {
        driver: true,
        Admin: true,
        addressInfo: true,
        SocialLink: true,
      },
    });
    return user;
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};
