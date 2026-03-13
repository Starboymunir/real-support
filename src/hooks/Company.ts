import axiosInstance from "@/lib/axios";
import { Company } from "@prisma/client";
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

