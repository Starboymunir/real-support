import { apiClient } from "@/lib/ApiClient";

const checkDriverDocuments = async (driverId) => {
  const result = await apiClient.get(`/admin/drivers/${driverId}`);
  const documents = result.data?.document;
  if (!documents) return false;
  return (
    documents?.drivingLicense?.details?.isVerified &&
    documents?.bankDocuments?.details?.isVerified &&
    documents?.pcoDocuments?.details?.isVerified &&
    documents?.passport?.details?.isVerified &&
    documents?.addressProfDocs?.details?.isVerified
  );
};

const changeStatusDriver = async (id, status) => {
  try {
    const result = await apiClient.patch(`/admin/drivers/${id}/status`, { status });
    return { data: result.data, statusCode: 200 };
  } catch (error) {
    return { message: error.message, statusCode: 400 };
  }
};

const getAllOnlineDrivers = async (packageId) => {
  const url = packageId
    ? `/admin/drivers?isOnline=true&status=ACTIVE&packageId=${packageId}&count=1000`
    : `/admin/drivers?isOnline=true&status=ACTIVE&count=1000`;
  const result = await apiClient.get(url);
  return result.data || [];
};

const changeCarStatus = async (id, status) => {
  try {
    const result = await apiClient.patch(`/admin/drivers/cars/${id}/status`, { status });
    return { data: result.data, statusCode: 200 };
  } catch (error) {
    return { message: error.message, statusCode: 400 };
  }
};

const assignPackageDriver = async (id, packageId) => {
  const result = await apiClient.patch(`/admin/drivers/${id}/assignPackage`, { packageId });
  return result.data;
};

const assignPackages = async (id, data) => {
  try {
    const result = await apiClient.patch(`/admin/drivers/${id}/assignPackage`, data);
    return result.data;
  } catch (error) {
    console.error("Error assigning packages to driver:", error);
    throw error;
  }
};

const removePackages = async (driverId, packagesToRemove) => {
  try {
    const result = await apiClient.patch(`/admin/drivers/${driverId}/removePackage`, { packages: packagesToRemove });
    return result.data;
  } catch (error) {
    console.error("Error removing packages from driver:", error);
    throw error;
  }
};

async function getDriverStats(startDate, endDate, hardFilter) {
  try {
    const params = new URLSearchParams({ count: "1000" });
    if (hardFilter) params.set("hardFilter", hardFilter);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    const driversResult = await apiClient.get(`/admin/drivers?count=1000`);
    const drivers = driversResult.data || [];

    const bookingsResult = await apiClient.get(`/admin/bookings?status=COMPLETED&count=10000${hardFilter ? `&hardFilter=${hardFilter}` : ""}${startDate ? `&startDate=${startDate}` : ""}${endDate ? `&endDate=${endDate}` : ""}`);
    const allBookings = bookingsResult.data || [];

    const driverStats = drivers.map((driver) => {
      const bookings = allBookings.filter((b) => b.driverId === driver.id);
      const totalJobs = bookings.length;
      const totalValue = bookings.reduce((t, b) => t + (b.totalBill || 0), 0);
      const cardPay = bookings.reduce((t, b) =>
        t + (["CASH", "WALLET"].includes(b.paymentType) ? b.totalBill || 0 : 0), 0);
      const cashPay = bookings.reduce((t, b) =>
        t + (b.paymentType === "CASH" ? b.totalBill || 0 : 0), 0);
      const commission = bookings.reduce((t, b) => t + (b.commission || 0), 0);
      return {
        driverId: driver.id,
        driverName: driver,
        totalJobs,
        totalValue,
        cardPay,
        cashPay,
        tip: 0,
        commission,
        totalAfterCommission: totalValue - commission,
      };
    });

    return { data: driverStats };
  } catch (error) {
    console.error("Error fetching driver stats:", error);
    return { data: [] };
  }
}

export {
  changeStatusDriver,
  changeCarStatus,
  getAllOnlineDrivers,
  assignPackageDriver,
  assignPackages,
  removePackages,
  getDriverStats,
};
