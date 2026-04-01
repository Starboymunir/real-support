import { apiClient } from "@/lib/ApiClient";

export const findAllBookings = async () => {
  try {
    const res = await apiClient.get("/admin/bookings");
    return res.data || [];
  } catch {
    return [];
  }
};

export const findAllRideRequest = async () => {
  try {
    const res = await apiClient.get("/admin/requests");
    return res.data || [];
  } catch {
    return [];
  }
};

export const findBooking = async (id) => {
  try {
    const res = await apiClient.get(`/admin/bookings/${id}`);
    return res.data ? [res.data] : [];
  } catch {
    return [];
  }
};

export const createBooking = async (data) => {
  const res = await apiClient.post("/admin/bookings", data);
  return res.data;
};

export const findAllRideBidRequest = async (id) => {
  try {
    const res = await apiClient.get(`/bids/${id}`);
    return res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : [];
  } catch {
    return [];
  }
};

export const createBidPlace = async (data) => {
  const res = await apiClient.post("/bids", data);
  return res.data;
};

export const findCart = async (id) => {
  try {
    const res = await apiClient.get(`/requests/${id}`);
    return res.data;
  } catch {
    return null;
  }
};

export const createCart = async (data, startFromId, destinationId) => {
  const tempData = { ...data, startFromId, destinationId };
  delete tempData.startAddress;
  delete tempData.destinationAddress;
  delete tempData.stoppages;

  const res = await apiClient.post("/requests", {
    ...tempData,
    totalBill: Number(tempData.totalBill),
    totalDistance: Number(tempData.totalDistance),
  });
  return res.data;
};

export const createAddress = async (data) => {
  const res = await apiClient.post("/addresses", data);
  return res.data;
};

export const createStopages = async (stoppages, requestId, userId) => {
  if (stoppages?.length && requestId) {
    const result = [];
    for (let i = 0; i < stoppages?.length - 1; ++i) {
      const newStopages = await createAddress({
        ...stoppages[i],
        requestId,
        userId,
      });
      result.push(newStopages);
    }
    return result;
  }
};
