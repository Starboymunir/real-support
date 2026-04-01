import { apiClient } from "@/lib/ApiClient";

const getBookingByPassenger = async (passengerId) => {
  try {
    const result = await apiClient.get(`/admin/bookings?passengerId=${passengerId}`);
    return { data: result.data || [], statusCode: 200 };
  } catch (err) {
    return { message: err.message, statusCode: 400 };
  }
};

async function getCompleteBookingCountsForTodayThisMonthThisYear() {
  const result = await apiClient.get("/admin/bookings?status=COMPLETED&count=10000");
  const bookings = result.data || [];

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  let startOfYear;
  if (today.getMonth() < 3 || (today.getMonth() === 3 && today.getDate() < 6)) {
    startOfYear = new Date(today.getFullYear() - 1, 3, 6);
  } else {
    startOfYear = new Date(today.getFullYear(), 3, 6);
  }
  const endOfYear = new Date(startOfYear.getFullYear() + 1, 3, 6);

  const toDate = (d) => new Date(d);

  const todayCount = bookings.filter((b) => {
    const d = toDate(b.createdAt);
    return d >= startOfDay && d < endOfDay;
  }).length;

  const thisMonthCount = bookings.filter((b) => {
    const d = toDate(b.createdAt);
    return d >= startOfMonth && d <= endOfMonth;
  }).length;

  const thisYearCount = bookings.filter((b) => {
    const d = toDate(b.createdAt);
    return d >= startOfYear && d < endOfYear;
  }).length;

  return { today: todayCount, month: thisMonthCount, year: thisYearCount };
}

async function getCompleteBookingCountsForTodayThisMonthThisYearForDriver(driverId) {
  const result = await apiClient.get(`/admin/bookings?status=COMPLETED&driverId=${driverId}&count=10000`);
  const bookings = result.data || [];

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);

  let startOfYear;
  if (today.getMonth() < 3 || (today.getMonth() === 3 && today.getDate() < 6)) {
    startOfYear = new Date(today.getFullYear() - 1, 3, 6);
  } else {
    startOfYear = new Date(today.getFullYear(), 3, 6);
  }
  const endOfYear = new Date(startOfYear.getFullYear() + 1, 3, 6);

  const toDate = (d) => new Date(d);

  const todayCount = bookings.filter((b) => { const d = toDate(b.createdAt); return d >= startOfDay && d < endOfDay; }).length;
  const thisMonthCount = bookings.filter((b) => { const d = toDate(b.createdAt); return d >= startOfMonth && d <= endOfMonth; }).length;
  const thisYearCount = bookings.filter((b) => { const d = toDate(b.createdAt); return d >= startOfYear && d < endOfYear; }).length;
  const thisWeekCount = bookings.filter((b) => { const d = toDate(b.createdAt); return d >= startOfWeek && d < endOfWeek; }).length;

  return { today: todayCount, month: thisMonthCount, year: thisYearCount, week: thisWeekCount };
}

const getBookingRequests = async () => {
  try {
    const result = await apiClient.get("/admin/requests");
    return { data: result.data || [], statusCode: 200 };
  } catch (err) {
    return { message: err.message, statusCode: 400 };
  }
};

export const getCoupon = async (coupon) => {
  try {
    const result = await apiClient.post("/coupons/apply", { coupon });
    if (!result.data) {
      return { message: "Coupon Not found", statusCode: 404, data: null };
    }
    return { data: result.data, statusCode: 200, message: "Successfully fetched Coupon" };
  } catch (err) {
    return { message: "Coupon Not found", statusCode: 404, data: null };
  }
};

const getBookingById = async (bookingId) => {
  try {
    const result = await apiClient.get(`/admin/bookings/${bookingId}`);
    return { data: result.data, statusCode: 200 };
  } catch (error) {
    return { message: error.message, statusCode: 400 };
  }
};

const getBookingsByDriverId = async (driverId, startDate, endDate, hardFilter) => {
  try {
    const params = new URLSearchParams({
      driverId,
      status: "COMPLETED",
      count: "10000",
    });

    if (hardFilter) params.set("hardFilter", hardFilter);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    const result = await apiClient.get(`/admin/bookings?${params.toString()}`);
    return { data: result.data || [], statusCode: 200 };
  } catch (error) {
    return { message: error.message, statusCode: 400 };
  }
};

const getBookingRequestById = async (id) => {
  try {
    const result = await apiClient.get(`/admin/requests/${id}`);
    return { data: result.data, statusCode: 200 };
  } catch (error) {
    return { message: error.message, statusCode: 400 };
  }
};

export {
  getBookingByPassenger,
  getCompleteBookingCountsForTodayThisMonthThisYear,
  getCompleteBookingCountsForTodayThisMonthThisYearForDriver,
  getBookingRequests,
  getBookingById,
  getBookingRequestById,
  getBookingsByDriverId,
};
