import axiosInstance from "@/lib/admin-axios";
import { DiscountCoupons } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export const useGetAllDiscountCoupons = () => {
  return useQuery<DiscountCoupons[], Error>({
    queryKey: ["discountCoupons"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/coupons");
      return data.data;
    },
  });
};

export const useGetDiscountCouponById = (id: string) => {
  return useQuery<DiscountCoupons, Error>({
    queryKey: ["discountCoupons", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/coupons/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};
