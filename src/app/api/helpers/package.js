import { apiClient } from "@/lib/ApiClient";

export const createPackage = async (data) => {
  const res = await apiClient.post("/admin/packages", {
    ...data,
    sortIndex: Number(data.sortIndex),
    serviceFee: Number(data.serviceFee),
    pricePerMilage: Number(data.pricePerMilage),
    drivingProMin: Number(data.drivingProMin),
    waitingProMin: Number(data.waitingProMin),
    minBill: Number(data.minBill),
    vat: Number(data.vat),
  });
  return res.data;
};

export const findAllPackages = async () => {
  try {
    const res = await apiClient.get("/admin/packages");
    return res.data || [];
  } catch {
    return [];
  }
};

export const findPackage = async (id) => {
  try {
    const res = await apiClient.get(`/admin/packages/${id}`);
    return res.data;
  } catch {
    return null;
  }
};

export const findPackageByName = async (name) => {
  try {
    const res = await apiClient.get(`/admin/packages?name=${encodeURIComponent(name)}`);
    const packages = res.data || [];
    return Array.isArray(packages) ? packages[0] || null : packages;
  } catch {
    return null;
  }
};

export const updatePackage = async (id, data, prevData) => {
  const res = await apiClient.put(`/admin/packages/${id}`, {
    ...data,
    coverImage: data.coverImage ? data.coverImage : prevData.coverImage,
    sortIndex: data?.sortIndex ? Number(data.sortIndex) : prevData.sortIndex,
    serviceFee: data?.serviceFee ? Number(data.serviceFee) : prevData.serviceFee,
    pricePerMilage: data?.pricePerMilage ? Number(data.pricePerMilage) : prevData.pricePerMilage,
    drivingProMin: data?.drivingProMin ? Number(data.drivingProMin) : prevData.drivingProMin,
    waitingProMin: data?.waitingProMin ? Number(data.waitingProMin) : prevData.waitingProMin,
    minBill: data?.minBill ? Number(data.minBill) : prevData.minBill,
    vat: data?.vat ? Number(data.vat) : prevData.vat,
  });
  return res.data;
};

export const deletePackage = async (id) => {
  const res = await apiClient.patch(`/packages/admin/${id}`, { status: false });
  return res.data;
};
