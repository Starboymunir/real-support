import { NextResponse } from "next/server";
import { api } from "@/lib/api";

export const findUserByCognitoId = async (cognitoId: string) => {
  try {
    const result = await api.get(`/users/cognito/${cognitoId}`);
    return (result as any)?.data || result;
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};
