import { apiClient } from "@/lib/ApiClient";

async function createDiscountCoupon(data: any) {
  const { coupon, discount, expiry, useability } = data || {};
  try {
    const result = await apiClient.post("/coupons", { coupon, discount, expiry, useability });
    return { statusCode: 200, data: result.data };
  } catch (error: any) {
    console.log(error);
    return { statusCode: 500, message: error.message || "Internal Server Error" };
  }
}

async function updateDiscountCoupon(id: string, data: any) {
  try {
    const { coupon, discount, expiry, useability } = data || {};
    const result = await apiClient.patch(`/coupons/${id}`, { coupon, discount, expiry, useability });
    return { statusCode: 200, data: result.data };
  } catch (error: any) {
    console.log(error);
    return { statusCode: 500, message: error.message || "Internal Server Error" };
  }
}

async function updateIsActive(id: string, isActive: boolean) {
  try {
    const result = await apiClient.patch(`/coupons/${id}`, { isActive });
    return { statusCode: 200, data: result.data };
  } catch (error: any) {
    console.log(error);
    return { statusCode: 500, message: error.message || "Internal Server Error" };
  }
}

async function getDiscountCouponById(id: string) {
  try {
    const result = await apiClient.get(`/coupons/${id}`);
    if (!result.data) {
      return { statusCode: 404, message: "Discount Coupons not found" };
    }
    return { statusCode: 200, data: result.data };
  } catch (error: any) {
    console.log(error);
    return { statusCode: 500, message: error.message || "Internal Server Error" };
  }
}

async function getAllDiscountCoupons() {
  try {
    const result = await apiClient.get("/coupons");
    return { statusCode: 200, data: result.data || [] };
  } catch (error: any) {
    console.log(error);
    return { statusCode: 500, message: error.message || "Internal Server Error" };
  }
}

async function deleteDiscountCoupon(id: string) {
  try {
    await apiClient.delete(`/coupons/${id}`);
    return { statusCode: 200, message: "Coupon deleted successfully" };
  } catch (error: any) {
    console.log(error);
    return { statusCode: 500, message: error.message || "Internal Server Error" };
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
