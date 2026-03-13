"use server";

import prisma from "@/database/prisma";

// Function to create a new coupon
export async function createCoupon(
  coupon: string,
  discount: number,
  expiry: Date
) {
  const newCoupon = await prisma.discountCoupons.create({
    data: {
      coupon,
      discount,
      expiry,
    },
  });
  return newCoupon;
}
export const getCoupon = async (coupon: string) => {
  const couponData = await prisma.discountCoupons.findFirst({
    where: {
      coupon: coupon,
      isActive: true,
    },
  });
  if (!couponData) {
    return { message: "Coupon Not found", statusCode: 404, data: null };
  } else {
    return {
      data: couponData,
      statusCode: 200,
      message: "Successfully fetched Coupon",
    };
  }
};

// Function to get all coupons
export async function getAllCoupons() {
  const coupons = await prisma.discountCoupons.findMany({
    where: {
      isActive: true,
    },
  });
  return coupons;
}

// Function to get a single coupon by ID
export async function getCouponById(id: string) {
  const coupon = await prisma.discountCoupons.findUnique({
    where: {
      id,
      isActive: true,
    },
  });
  return coupon;
}

// Function to update a coupon
export async function updateCoupon(
  id: string,
  data: { coupon?: string; discount?: number; expiry?: Date }
) {
  const updatedCoupon = await prisma.discountCoupons.update({
    where: {
      id,
    },
    data,
  });
  return updatedCoupon;
}

// Function to delete a coupon
export async function deleteCoupon(id: string) {
  const deletedCoupon = await prisma.discountCoupons.delete({
    where: {
      id,
    },
  });
  return deletedCoupon;
}
