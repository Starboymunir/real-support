import { IBookingType, IRequestType } from "@/types/type";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Package, Transaction } from "@/types/prisma-types";
import { monthNames } from "./data";
import { fDate } from "@/lib/utils/format-time";
import jwt from "jsonwebtoken";
import axiosInstance from "./axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCurrentTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5); // Add 5 minutes
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const formattedPrice = (
  price: number | string,
  options: {
    currency?: "USD" | "EUR" | "GBP";
    notation?: Intl.NumberFormatOptions["notation"];
    locale?: string; // 🔹 allow overriding locale
  } = {}
) => {
  const {
    currency = "GBP",
    notation = "compact",
    locale = "en-GB", // 🔹 default UK English locale
  } = options;

  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  // ✅ handle invalid numbers gracefully
  if (isNaN(numericPrice)) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(0);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice);
};

export const formatToLocalDate = (
  date: Date | string | number,
  options: {
    withTime?: boolean;
    locale?: string;
    formatOptions?: Intl.DateTimeFormatOptions;
  } = {}
): string => {
  const { withTime = false, locale = undefined, formatOptions = {} } = options;

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return ""; // ✅ handle invalid date safely
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime
      ? { hour: "2-digit", minute: "2-digit" } // ✅ add time when requested
      : {}),
  };

  return parsedDate.toLocaleDateString(locale, {
    ...defaultOptions,
    ...formatOptions, // ✅ allow custom overrides
  });
};


export const formatBookingTableData = (bookings: IBookingType[]) => {
  const formatedData = bookings?.map((booking) => ({
    name: booking?.driverName,
    drop: booking?.destination?.name,
    from: booking?.startFrom?.name,
    price: booking?.totalBill,
  }));
  return formatedData;
};
export const formatBookingCardData = (bookings: IBookingType[]) => {
  const formatedData = bookings?.map((booking) => ({
    type: booking.paymentType,
    distance: booking.totalDistance,
    date: booking.bookingDate,
    time: booking.bookingTime,
    status: booking.status,
    name: booking?.driverName,
    drop: booking?.destination?.description,
    from: booking?.startFrom?.description,
    price: booking?.totalBill,
  }));
  return formatedData;
};

export const formatRequestCardData = (requests: any[]) => {
  const formatedData = requests?.map((request: any) => ({
    id: request.id,
    image: request?.riderInfo?.coverImage,
    type: request?.paymentType,
    distance: request?.totalDistance,
    date: request?.bookingDate,
    time: request?.bookingTime,
    status: request?.status,
    name: request?.riderInfo?.firstName + " " + request?.riderInfo?.lastName,
    drop: request?.destination?.description,
    from: request?.startFrom?.description,
    price: request?.totalBill,
  }));
  return formatedData;
};

export function formatDate(dateString: string | Date) {
  const date = new Date(dateString);
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${month}-${year}`;
}

export const calculatePrice = (
  distance: number,
  travelTime: number,
  data: Package
): number => {
  // Calculate price based on distance
  const distanceInMiles = distance / 1609.34;
  const travelTimeInMinutes = travelTime / 60;

  let distancePrice: number;
  if (distanceInMiles <= 10) {
    distancePrice = distanceInMiles * data.pricePerMilage;
  } else if (distanceInMiles <= 30) {
    distancePrice =
      10 * data.pricePerMilage +
      (distanceInMiles - 10) *
        (data.pricePerMilage - data.pricePerMilage * 0.1); // 10% discount
  } else {
    distancePrice =
      10 * data.pricePerMilage +
      20 * (data.pricePerMilage - data.pricePerMilage * 0.1) +
      (distanceInMiles - 30) *
        (data.pricePerMilage - data.pricePerMilage * 0.2); // 25% discount
  }

  // Calculate price based on travel time
  const travelTimePrice: number = travelTimeInMinutes * data.drivingProMin;

  // Compare prices and return the maximum, or minimum of 7
  const price: number =
    Math.max(distancePrice, travelTimePrice) + data.serviceFee;

  return Math.max(price, data.minBill);
};

export const priceAndServiceFee = async (
  distance: number,
  travelTime: number,
  packageId: string
) => {
  const { data } = await axiosInstance.post("/others/calculate-price", {
    distance,
    time: travelTime,
    packageId,
  });
  return data.data;
};

export const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
};

export const generateToken = (obj: any) => {
  return jwt.sign(obj, "absd", {
    expiresIn: "12h",
  });
};

export const generateDocumentAccordionData = (document: any) => {
  return [
    {
      documentTitle: "drivingLicense",
      name: "License",
      documentsList: {
        licenseDocFront: document?.drivingLicense?.licenseDocFront,
        licenseDocBack: document?.drivingLicense?.licenseDocBack,
      },
    },
    {
      documentTitle: "bankDocuments",
      name: "Account proof",
      documentsList: {
        accProfDoc: document?.bankDocuments?.accProfDoc,
      },
    },
    {
      documentTitle: "pcoDocuments",
      name: "PCO badge",

      documentsList: {
        pcoBadgeDocFront: document?.pcoDocuments?.pcoBadgeDocFront,
        pcoBadgeDocBack: document?.pcoDocuments?.pcoBadgeDocBack,
        pcoPaperDoc: document?.pcoDocuments?.pcoPaperDoc,
      },
    },
    {
      documentTitle: "passport",
      name: "Passport",
      documentsList: {
        passportDocFront: document?.passport?.passportDocFront,
        passportDocBack: document?.passport?.passportDocBack,
      },
    },
    {
      documentTitle: "addressProfDocs",
      name: "Address proof",
      documentsList: {
        addressProfDoc: document?.addressProfDocs?.addressProfDoc,
      },
    },
  ];
};

export const generateCarDocumentAccordionData = (document: any) => {
  return [
    {
      documentTitle: "motDocument",
      name: "MOT Document",
      documentsList: {
        motDoc: document?.motDocument?.motDoc,
      },
    },
    {
      documentTitle: "insuranceDocument",
      name: "Insurance Document",
      documentsList: {
        insuranceDoc: document?.insuranceDocument?.insuranceDoc,
      },
    },
    {
      documentTitle: "pCOVehicleLicense",
      name: "PCO License Document",
      documentsList: {
        pcoVehicleLicenseDoc: document?.pCOVehicleLicense?.pcoVehicleLicenseDoc,
      },
    },
    {
      documentTitle: "vehicleLogBook",
      name: "Log Book Document",
      documentsList: {
        vehicleLogBookDoc: document?.vehicleLogBook?.vehicleLogBookDoc,
      },
    },
  ];
};

export const generateLegalInfoData = (document: any) => {
  return [
    {
      name: "Sort code",
      group: "bankDocuments",
      value: document?.bankDocuments?.sortCode,
    },
    {
      name: "Bank name",
      group: "bankDocuments",
      value: document?.bankDocuments?.bankName,
    },
    {
      name: "Account Number",
      group: "bankDocuments",
      value: document?.bankDocuments?.accountNumber,
    },
    {
      name: "License number",
      group: "drivingLicense",
      value: document?.drivingLicense?.licenseNumber,
    },
    {
      name: "License expiry date",
      group: "drivingLicense",
      value: fDate(document?.drivingLicense?.licenseExpiryDate),
    },
    {
      name: "PCO badge number",
      group: "pcoDocuments",
      value: document?.pcoDocuments?.pcoBadgeNumber,
    },
    {
      name: "PCO badge expiry date",
      group: "pcoDocuments",
      value: fDate(document?.pcoDocuments?.pcoBadgeExpiryDate),
    },
    {
      name: "Work permit code",
      group: "nogroup",
      value: document?.workPermitCode,
    },
    {
      name: "Passport number",
      group: "passport",
      value: document?.passport?.passportNumber,
    },
    {
      name: "Passport expiry date",
      group: "passport",
      value: fDate(document?.passport?.passportExpiryDate),
    },
    {
      name: "House number",
      group: "addressProfDocs",
      value: document?.addressProfDocs?.houseNumber,
    },
    {
      name: "State",
      group: "addressProfDocs",
      value: document?.addressProfDocs?.state,
    },
    {
      name: "Zip Code/Postal Code",
      group: "addressProfDocs",
      value: document?.addressProfDocs?.addressCode,
    },
    {
      name: "Street Address",
      group: "addressProfDocs",
      value: document?.addressProfDocs?.streetAddress,
    },
    {
      name: "City",
      group: "addressProfDocs",
      value: document?.addressProfDocs?.city,
    },
  ];
};

export const convertToISOTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours));
  date.setMinutes(parseInt(minutes));
  return date;
};

export const isDateInThePast = (givenDate: Date | string) => {
  const date = typeof givenDate === "string" ? new Date(givenDate) : givenDate;
  const currentDate = new Date();
  return date < currentDate;
};


export const ReturnHtmlForSms = (otp: string) => {
  return `<html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Send Otp</title>
    </head>
    <body>
      <h1>Dear Your Verification OTP Is</h1>
      <p>${otp}</p>
      <p>Thank you,</p>
      <p>Rider Share Team</p>
    </body>
  </html>`;
};

export const calculateTotalAmount = (
  transactions: Transaction[],
  type: string,
  type2?: string
) => {
  // Calculate total for the first type
  const totalType1 =
    transactions
      ?.filter((transaction) => transaction.type === type)
      .reduce((acc, cur) => acc + cur.amount, 0) || 0;

  // If no second type provided, just return the first type's total
  if (!type2) return totalType1;

  const totalType2 =
    transactions
      ?.filter((transaction) => transaction.type === type2)
      .reduce((acc, cur) => acc + cur.amount, 0) || 0;

  const difference = Math.abs(totalType1) - totalType2;
  // Return the difference (leftover)
  return difference;
};

export const formatDistance = (distance: number): string => {
  const distanceInMiles = (distance / 1609.34).toFixed(2);
  return `${distanceInMiles} mile${parseFloat(distanceInMiles) > 1 ? "s" : ""}`;
};

export const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);

  const hourText = hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : "";
  const minuteText =
    minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""}` : "";

  // Combine hour and minute text, handling cases where one or both are zero
  return [hourText, minuteText].filter(Boolean).join(" ");
};

// export const formatDuration = (duration: number): string => {
//   const durationInMinutes = (duration / 60).toFixed(2)
//   return `${durationInMinutes} minute${parseFloat(durationInMinutes) > 1 ? 's' : ''}`
// }
