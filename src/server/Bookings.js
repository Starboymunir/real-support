"use server";

import InvoicePDF from "@/app/(RSAdmin)/admin/dashboard/bookings/_components/booking-invoice-pdf";
import prisma from "@/database/prisma";
import ReactPDF from "@react-pdf/renderer";

const getBookingByPassenger = async (passengerId) => {
  try {
    const result = await prisma.booking.findMany({
      include: {
        startFrom: true,
        destination: true,
        stoppages: true,
        packageInfo: true,
        driverInfo: {
          include: {
            userInfo: true,
            document: true,
            car: {
              include: {
                carDocument: true,
              },
            },
          },
        },
        requestInfo: {
          include: {
            startFrom: true,
            destination: true,
            stoppages: true,
            packageInfo: true,
          },
        },
        riderInfo: true,
      },
      where: {
        passengerId,
      },
    });

    return { data: result, statusCode: 200 };
  } catch (err) {
    console.log("Error ni", err);
    return { message: err.message, statusCode: 400 };
  }
};

async function getCompleteBookingCountsForTodayThisMonthThisYear() {
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  let startOfYear;
  let endOfYear;

  if (today.getMonth() < 3 || (today.getMonth() === 3 && today.getDate() < 6)) {
    startOfYear = new Date(today.getFullYear() - 1, 3, 6);
  } else {
    startOfYear = new Date(today.getFullYear(), 3, 6);
  }
  endOfYear = new Date(startOfYear.getFullYear() + 1, 3, 6);

  console.log({ startOfYear, endOfYear });
  const todayCount = await prisma.booking.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
      status: "COMPLETED",
    },
  });

  const thisMonthCount = await prisma.booking.count({
    where: {
      createdAt: {
        gte: startOfMonth,
        lt: endOfMonth,
      },
      status: "COMPLETED",
    },
  });

  const thisYearCount = await prisma.booking.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
      status: "COMPLETED",
    },
  });

  return {
    today: todayCount,
    month: thisMonthCount,
    year: thisYearCount,
  };
}
async function getCompleteBookingCountsForTodayThisMonthThisYearForDriver(
  driverId
) {
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  let startOfYear;
  let endOfYear;

  if (today.getMonth() < 3 || (today.getMonth() === 3 && today.getDate() < 6)) {
    startOfYear = new Date(today.getFullYear() - 1, 3, 6);
  } else {
    startOfYear = new Date(today.getFullYear(), 3, 6);
  }
  endOfYear = new Date(startOfYear.getFullYear() + 1, 3, 6);

  // Calculate start and end dates of the current week
  const startOfWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay()
  );
  const endOfWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay() + 7
  );

  console.log({
    startOfYear,
    endOfYear,
    startOfDay,
    endOfDay,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    driverId,
  });

  const todayCount = await prisma.booking.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
      status: "COMPLETED",
      driverId,
    },
  });

  const thisMonthCount = await prisma.booking.count({
    where: {
      createdAt: {
        gte: startOfMonth,
        lt: endOfMonth,
      },
      status: "COMPLETED",
      driverId,
    },
  });

  const thisYearCount = await prisma.booking.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
      status: "COMPLETED",
      driverId,
    },
  });

  const thisWeekCount = await prisma.booking.count({
    where: {
      createdAt: {
        gte: startOfWeek,
        lt: endOfWeek,
      },
      status: "COMPLETED",
      driverId,
    },
  });

  console.log({
    today: todayCount,
    month: thisMonthCount,
    year: thisYearCount,
    week: thisWeekCount,
  });

  return {
    today: todayCount,
    month: thisMonthCount,
    year: thisYearCount,
    week: thisWeekCount,
  };
}

const generateInvoice = async (invoice) => {
  const blob = await ReactPDF.render(new InvoicePDF({ invoice: invoice }), {
    blob: true,
  });
  console.log("BLob data", blob);
};

const getBookingRequests = async () => {
  const requests = await prisma.request.findMany({
    include: {
      startFrom: true,
      destination: true,
      stoppages: true,
      packageInfo: true,
      riderInfo: true,
    },
  });
  return { data: requests, statusCode: 200 };
};

export const getCoupon = async (coupon) => {
  const couponData = await prisma.discountCoupons.findFirst({
    where: {
      coupon,
    },
  });
  if (!couponData) {
    return { message: "Coupon Not found", statusCode: 404, data: null };
  } else {
    return {
      data: couponData,
      statusCode: 200,
      message: "Successfully fetched Coupon",
    };
  }
};

const getBookingById = async (bookingId) => {
  try {
    const result = await prisma.booking.findFirst({
      where: {
        id: bookingId,
      },
      include: {
        startFrom: true,
        destination: true,
        stoppages: true,
        packageInfo: true,
        driverInfo: {
          include: {
            userInfo: true,
            document: true,
            car: {
              include: {
                carDocument: true,
              },
            },
          },
        },
        requestInfo: {
          include: {
            startFrom: true,
            destination: true,
            stoppages: true,
            packageInfo: true,
          },
        },
        riderInfo: true,
      },
    });
    return { data: result, statusCode: 200 };
  } catch (error) {
    console.log(error);
    return { message: error.message, statusCode: 400 };
  }
};

const getBookingsByDriverId = async (
  driverId,
  startDate,
  endDate,
  hardFilter
) => {
  let dateRangeFilter = {};

  // Prepare filtering conditions for the date range
  if (startDate !== null && endDate !== null) {
    dateRangeFilter.createdAt = {
      gte: startDate,
      lt: endDate,
    };
  } else if (startDate !== null) {
    dateRangeFilter.createdAt = {
      gte: startDate,
    };
  } else if (endDate !== null) {
    dateRangeFilter.createdAt = {
      lt: endDate,
    };
  }

  // Prepare filtering conditions based on the hardFilter
  let hardFilterConditions = {};
  if (hardFilter === "today") {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    hardFilterConditions.createdAt = {
      gte: startOfToday,
      lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    };
  } else if (hardFilter === "monthly") {
    const today = new Date();
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    hardFilterConditions.createdAt = {
      gte: startOfThisMonth,
      lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
    };
  } else if (hardFilter === "yearly") {
    const today = new Date();
    let startOfThisYear;
    if (
      today.getMonth() < 3 ||
      (today.getMonth() === 3 && today.getDate() < 6)
    ) {
      startOfThisYear = new Date(today.getFullYear() - 1, 3, 6);
    } else {
      startOfThisYear = new Date(today.getFullYear(), 3, 6);
    }
    hardFilterConditions.createdAt = {
      gte: startOfThisYear,
      lt: new Date(startOfThisYear.getFullYear() + 1, 3, 6),
    };
  } else if (hardFilter === "weekly") {
    // Calculate start and end of the current week
    const today = new Date();
    const startOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay()
    );
    const endOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay() + 7
    );
    hardFilterConditions.createdAt = {
      gte: startOfWeek,
      lt: endOfWeek,
    };
  }

  // Apply strict filtering based on the hardFilter
  if (hardFilterConditions.createdAt) {
    dateRangeFilter = hardFilterConditions;
  }

  try {
    const result = await prisma.booking.findMany({
      where: {
        driverId,
        status: "COMPLETED",
        ...dateRangeFilter,
      },
      include: {
        startFrom: true,
        destination: true,
        stoppages: true,
        packageInfo: true,
        driverInfo: {
          include: {
            userInfo: true,
            document: true,
            car: {
              include: {
                carDocument: true,
              },
            },
          },
        },
        requestInfo: {
          include: {
            startFrom: true,
            destination: true,
            stoppages: true,
            packageInfo: true,
          },
        },
        riderInfo: true,
      },
    });
    return { data: result, statusCode: 200 };
  } catch (error) {
    console.log(error);
    return { message: error.message, statusCode: 400 };
  }
};

// type HardFilter = "today" | "weekly" | "monthly" | "yearly" | null;

// export const getBookingsByDriverId = async (
//   driverId: string,
//   startDate: Date | null,
//   endDate: Date | null,
//   hardFilter: HardFilter
// ) => {
//   try {
//     let dateRangeFilter: Record<string, any> = {};

//     // -------------------------------
//     // Hard filter overrides
//     // -------------------------------
//     if (hardFilter) {
//       const today = new Date();

//       if (hardFilter === "today") {
//         const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
//         const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
//         dateRangeFilter.createdAt = { gte: startOfToday, lt: endOfToday };
//       }

//       if (hardFilter === "weekly") {
//         const startOfWeek = new Date(today);
//         startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
//         const endOfWeek = new Date(startOfWeek);
//         endOfWeek.setDate(startOfWeek.getDate() + 7);
//         dateRangeFilter.createdAt = { gte: startOfWeek, lt: endOfWeek };
//       }

//       if (hardFilter === "monthly") {
//         const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//         const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
//         dateRangeFilter.createdAt = { gte: startOfMonth, lt: endOfMonth };
//       }

//       if (hardFilter === "yearly") {
//         // Fiscal year starting April 6
//         let startOfYear: Date;
//         if (today.getMonth() < 3 || (today.getMonth() === 3 && today.getDate() < 6)) {
//           startOfYear = new Date(today.getFullYear() - 1, 3, 6);
//         } else {
//           startOfYear = new Date(today.getFullYear(), 3, 6);
//         }
//         const endOfYear = new Date(startOfYear.getFullYear() + 1, 3, 6);
//         dateRangeFilter.createdAt = { gte: startOfYear, lt: endOfYear };
//       }
//     }

//     // -------------------------------
//     // Custom date range (only if no hardFilter)
//     // -------------------------------
//     if (!hardFilter) {
//       if (startDate && endDate) {
//         dateRangeFilter.createdAt = { gte: startDate, lt: endDate };
//       } else if (startDate) {
//         dateRangeFilter.createdAt = { gte: startDate };
//       } else if (endDate) {
//         dateRangeFilter.createdAt = { lt: endDate };
//       }
//     }

//     // -------------------------------
//     // Query Prisma
//     // -------------------------------
//     const result = await prisma.booking.findMany({
//       where: {
//         driverId,
//         status: "COMPLETED",
//         ...dateRangeFilter,
//       },
//       include: {
//         startFrom: true,
//         destination: true,
//         stoppages: true,
//         packageInfo: true,
//         driverInfo: {
//           include: {
//             userInfo: true,
//             document: true,
//             car: { include: { carDocument: true } },
//           },
//         },
//         requestInfo: {
//           include: {
//             startFrom: true,
//             destination: true,
//             stoppages: true,
//             packageInfo: true,
//           },
//         },
//         riderInfo: true,
//       },
//     });

//     return { data: result, statusCode: 200 };
//   } catch (error: any) {
//     console.error("Error fetching bookings:", error);
//     return { message: error.message, statusCode: 400 };
//   }
// };


const getBookingRequestById = async (id) => {
  try {
    const result = await prisma.request.findFirst({
      where: {
        id,
      },
      include: {
        startFrom: true,
        destination: true,
        stoppages: true,
        riderInfo: true,
        packageInfo: true,
      },
    });
    return { data: result, statusCode: 200 };
  } catch (error) {
    console.log(error);
    return { message: error.message, statusCode: 400 };
  }
};

export {
  getBookingByPassenger,
  getBookingById,
  generateInvoice,
  getBookingRequests,
  getBookingRequestById,
  getCompleteBookingCountsForTodayThisMonthThisYear,
  getCompleteBookingCountsForTodayThisMonthThisYearForDriver,
  getBookingsByDriverId,
};
