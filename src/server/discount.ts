import { apiClient } from "@/lib/ApiClient";

export async function createCoupon(coupon: string, discount: number, expiry: Date) {
  const result = await apiClient.post("/coupons", { coupon, discount, expiry });
  return result.data;
}

export const getCoupon = async (coupon: string) => {
  try {
    const result = await apiClient.post("/coupons/apply", { coupon });
    if (!result.data) {
      return { message: "Coupon Not found", statusCode: 404, data: null };
    }
    return { data: result.data, statusCode: 200, message: "Successfully fetched Coupon" };
  } catch (err: any) {
    return { message: "Coupon Not found", statusCode: 404, data: null };
  }
};

export async function getAllCoupons() {
  const result = await apiClient.get("/coupons");
  return result.data || [];
}

export async function getCouponById(id: string) {
  const result = await apiClient.get(`/coupons/${id}`);
  return result.data;
}

export async function updateCoupon(id: string, data: { coupon?: string; discount?: number; expiry?: Date }) {
  const result = await apiClient.patch(`/coupons/${id}`, data);
  return result.data;
}

export async function deleteCoupon(id: string) {
  await apiClient.delete(`/coupons/${id}`);
  return { id };
}
