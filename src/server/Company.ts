import { apiClient } from "@/lib/ApiClient";

export const fetchCompanies = async () => {
  const result = await apiClient.get("/company/find-all");
  return result.data || [];
};

export const createCompany = async (company: any) => {
  const result = await apiClient.post("/company", company);
  return result.data;
};

export const updateCompany = async (company: any) => {
  const result = await apiClient.patch(`/company/updateById/${company.id}`, company);
  return result.data;
};

export const findCompany = async (id: string) => {
  const result = await apiClient.get(`/company/findById/${id}`);
  return result.data;
};

export const deleteCompany = async (id: string) => {
  await apiClient.delete(`/company/${id}`);
  return { id };
};

export const fetchCompanyAddresses = async (id: string) => {
  const result = await apiClient.get(`/company-address/company/${id}`);
  return result.data || [];
};

export const createCompanyAddress = async (address: any) => {
  const result = await apiClient.post("/company-address", address);
  return result.data;
};

export const updateCompanyAddress = async (address: any) => {
  const result = await apiClient.patch(`/company-address/${address.id}`, address);
  return result.data;
};

export const deleteCompanyAddress = async (id: string) => {
  await apiClient.delete(`/company-address/${id}`);
  return { id };
};

export const findCompanyAddress = async (id: string) => {
  const result = await apiClient.get(`/company-address/${id}`);
  return result.data;
};
