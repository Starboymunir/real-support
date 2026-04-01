import { apiClient } from "@/lib/ApiClient";
import { remove } from "aws-amplify/storage";

// Drivers
export const findAllDrivers = async () => {
  try {
    const res = await apiClient.get("/admin/drivers?count=1000");
    return res.data || [];
  } catch {
    return [];
  }
};

export const findDriver = async (id) => {
  try {
    const res = await apiClient.get(`/admin/drivers/${id}`);
    return res.data;
  } catch {
    return null;
  }
};

export const findDriverByUserId = async (userId) => {
  try {
    const res = await apiClient.get(`/admin/drivers?userId=${userId}`);
    const drivers = res.data || [];
    return Array.isArray(drivers) ? drivers[0] || null : drivers;
  } catch {
    return null;
  }
};

export const createDriver = async (data, userId, fileName) => {
  const tempData = { ...data };
  delete tempData.firstName;
  delete tempData.lastName;
  delete tempData.email;
  delete tempData.password;
  delete tempData.phone_number;
  delete tempData.profileImage;

  const res = await apiClient.post("/drivers/register", {
    ...tempData,
    userId,
    profileImage: fileName,
    depositePaid: Boolean(tempData?.depositePaid),
    ratings: tempData.ratings ? Number(tempData.ratings) : 0,
    totalJobComplete: tempData.totalJobComplete ? Number(tempData.totalJobComplete) : 0,
    depositeAmount: tempData.depositeAmount ? Number(tempData.depositeAmount) : 0,
    commision: tempData.commision ? Number(tempData.commision) : 0,
    currentBalance: tempData.currentBalance ? Number(tempData.currentBalance) : 0,
  });
  return res.data;
};

export const updateDriver = async (id, data, prevData, fileName) => {
  const tempData = { ...data };
  delete tempData?.firstName;
  delete tempData?.lastName;
  delete tempData?.phone_number;
  delete tempData?.emailAddress;
  delete tempData?.password;

  const res = await apiClient.patch(`/admin/drivers/${id}`, {
    ...tempData,
    profileImage: fileName ? fileName : prevData.profileImage,
    depositePaid: tempData.depositePaid ? Boolean(tempData?.depositePaid) : prevData.depositePaid,
    ratings: tempData.ratings ? Number(tempData.ratings) : prevData.ratings,
    totalJobComplete: tempData.totalJobComplete ? Number(tempData.totalJobComplete) : prevData.totalJobComplete,
    depositeAmount: tempData.depositeAmount ? Number(tempData.depositeAmount) : prevData.depositeAmount,
    commisionPercentage: tempData.commisionPercentage ? Number(tempData.commisionPercentage) : prevData.commisionPercentage,
  });

  if (fileName && prevData.profileImage) {
    await remove({ key: prevData.profileImage });
  }

  return res.data;
};

export const deleteDriver = async (id) => {
  const res = await apiClient.patch(`/admin/drivers/${id}`, { isDeleted: true });
  return res.data;
};

// update legal information
export const updateDocumentLegalInfo = async (id, data) => {
  const res = await apiClient.patch(`/admin/drivers/documents/${id}/legal-info`, data);
  return res.data;
};

export const updateCarDocumentLegalInfo = async (carId, data) => {
  const res = await apiClient.patch(`/admin/drivers/car-documents/${carId}`, data);
  return res.data;
};

// Driver Document
export const createDocument = async (data, fieldsToExtract, driverId) => {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key]);
  }
  formData.append("driverId", driverId);
  const res = await apiClient.post("/documents/driving-license", formData);
  return res.data;
};

export const updateDocument = async (data, driverId) => {
  const formData = new FormData();
  for (const field in data) {
    formData.append(field, data[field]);
  }
  formData.append("driverId", driverId);
  const res = await apiClient.patch(`/documents/driver/${driverId}`, formData);
  return res.data;
};

export const findDriverDocument = async (driverId) => {
  try {
    const res = await apiClient.get(`/documents/driver/${driverId}`);
    return res.data;
  } catch {
    return null;
  }
};

// Cars
export const findDriverCar = async (driverId) => {
  try {
    const res = await apiClient.get(`/driver-cars?driverId=${driverId}`);
    const cars = res.data;
    return Array.isArray(cars) ? cars[0] || null : cars;
  } catch {
    return null;
  }
};

export const findCar = async (id) => {
  try {
    const res = await apiClient.get(`/driver-cars/${id}`);
    return res.data;
  } catch {
    return null;
  }
};

export const createCar = async (data, fileName, driverId) => {
  const res = await apiClient.post("/driver-cars", {
    ...data,
    driverId,
    carImage: fileName,
  });
  return res.data;
};

export const updateCar = async (id, data, prevData, fileName) => {
  const res = await apiClient.patch(`/driver-cars/${id}`, {
    ...data,
    carImage: fileName ? fileName : prevData.carImage,
  });

  if (fileName && prevData.carImage) {
    await remove({ key: prevData.carImage });
  }

  return res.data;
};

export const findCarDocument = async (carId) => {
  try {
    const res = await apiClient.get(`/documents/car/${carId}`);
    return res.data;
  } catch {
    return null;
  }
};

export const createCarDocument = async (data, fieldsToExtract, carId) => {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key]);
  }
  formData.append("carId", carId);
  const res = await apiClient.post("/documents/driver/car/insurance", formData);
  return res.data;
};

export const updateCarDocument = async (data, carId) => {
  const formData = new FormData();
  for (const field in data) {
    formData.append(field, data[field]);
  }
  formData.append("carId", carId);
  const res = await apiClient.patch(`/documents/car/${carId}`, formData);
  return res.data;
};
