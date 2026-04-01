import axiosInstance from "@/lib/admin-axios";
import { Company } from "@/types/prisma-types";
import { useQuery } from "@tanstack/react-query";

export const useCompaniesQuery = () => {
  return useQuery({
    queryKey: ["all_companies"],
    queryFn: async () => getAllCompanies(),
  });
};

export const useCompanyQuery = (id: string) => {
  return useQuery<Company | null | Error>({
    queryKey: ["company", id],
    queryFn: async () => getCompanyInfo(id),
    enabled: !!id,
  });
};



const getAllCompanies = async () => {
  const { data } = await axiosInstance.get("/company/find-all");
  return data.data;
};

const getCompanyInfo = async (id: string) => {
  const { data } = await axiosInstance.get(`/company/findById/${id}`);
  return data.data;
};

export const useCompanyWalletQuery = (companyId: string) => {
  return useQuery({
    queryKey: ["company_wallet", companyId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/company/${companyId}/wallet`);
      return data.data;
    },
    enabled: !!companyId,
  });
};

