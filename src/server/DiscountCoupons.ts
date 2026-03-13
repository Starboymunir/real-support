"use server";

import prisma from "@/database/prisma";
import { DiscountCoupons } from "@prisma/client";

// Function to create a discount coupon
async function createDiscountCoupon(data: DiscountCoupons) {
  const { coupon, discount, expiry, useability } = data || {};
  try {
    const newCoupon = await prisma.discountCoupons.create({
      data: {
        coupon,
        discount,
        expiry,
        useability,
      },
    });
    return { statusCode: 200, data: newCoupon };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
}

// Function to update a discount coupon by ID
async function updateDiscountCoupon(id: string, data: DiscountCoupons) {
  try {
    const { coupon, discount, expiry, useability } = data || {};
    const updatedCoupon = await prisma.discountCoupons.update({
      where: {
        id,
      },
      data: {
        coupon,
        discount,
        expiry,
        useability,
      },
    });

    if (!updatedCoupon) {
      return { statusCode: 404, message: "Discount Coupon not found" };
    }
    return { statusCode: 200, data: updatedCoupon };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
}
// Function to update a discount coupon by ID
async function updateIsActive(id: string, isActive: boolean) {
  try {
    const updatedCoupon = await prisma.discountCoupons.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
    });

    if (!updatedCoupon) {
      return { statusCode: 404, message: "Discount Coupon not found" };
    }
    return { statusCode: 200, data: updatedCoupon };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
}

// Function to get a discount coupon by ID
async function getDiscountCouponById(id: string) {
  try {
    const coupon = await prisma.discountCoupons.findUnique({
      where: {
        id,
      },
    });

    if (!coupon) {
      return { statusCode: 404, message: "Discount Coupons not found" };
    }
    return { statusCode: 200, data: coupon };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
}

// Function to get all discount coupons
async function getAllDiscountCoupons() {
  try {
    const coupons = await prisma.discountCoupons.findMany();

    return { statusCode: 200, data: coupons };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
}

// Function to delete a discount coupon by ID
async function deleteDiscountCoupon(id: string) {
  try {
    const deletedCoupon = await prisma.discountCoupons.delete({
      where: {
        id,
      },
    });
    return { statusCode: 200, data: deletedCoupon };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
}

export {
  createDiscountCoupon,
  updateDiscountCoupon,
  getDiscountCouponById,
  getAllDiscountCoupons,
  deleteDiscountCoupon,
  updateIsActive,
};
