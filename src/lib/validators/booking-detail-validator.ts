import { z } from "zod";

const addressSchema = z.object({
  name: z.string(),
  description: z.string(),
  latitude: z.string().min(1, "latitude is required"),
  longitude: z.string().min(1, "latitude is required"),
  postCode: z.string(),
  houseNumber: z.string(),
  streetName: z.string(),
  city: z.string(),
});

export const isBookingTimeValid = (
  time: string,
  date: string | Date
): boolean => {
  if (date) {
    const currentDate = new Date();
    const splitDate = new Date(date)?.toISOString()?.split("T");
    const selectedDate = new Date(`${splitDate[0]}T${time}`);
    const pastTime = new Date(currentDate.getTime() - 3 * 60000);
    return selectedDate >= pastTime;
  }
  return true;
};

export const BookingAddressDetailAndTimeSchema = z
  .object({
    startFrom: addressSchema,
    destination: addressSchema,
    bookingDate: z.date().refine(
      (date) => {
        const currentDate = new Date();
        date.setHours(23, 59, 59, 999);
        return date >= currentDate;
      },
      {
        message: "Booking date cannot be in the past",
      }
    ),
    bookingTime: z.string().min(1, "Please select Time"),
  })
  .refine(
    (values) => isBookingTimeValid(values.bookingTime, values.bookingDate),
    {
      message: "Booking time cannot be in the past when booking date is today",
      path: ["bookingTime"],
    }
  );

export const PassengerAndPackageDetailSchema = z.object({
  totalLuggage: z.number(),
  totalPersons: z.number(),
  notes: z.string(),
  clientName: z.string().min(1, "Client name is Required"),
  clientPhone: z.string().min(9, "Phone number is required"),
  clientEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address" }),
  packageId: z.string().min(1, "Please select a package")
});

export const BookingSchema = z.object({
  bookingAddressDetailAndTime: BookingAddressDetailAndTimeSchema,
  PassengerAndPackageDetail: PassengerAndPackageDetailSchema,
  requestType: z.enum(["FIXED", "ADJUSTABLE"]).default("FIXED"),
  paymentType: z.enum(["CASH", "CASHANDWALLET", "WALLET"]).default("CASH"),
  totalBill: z.number(),
  serviceCharge: z.number(),
  totalCash: z.number().nullable().default(null),
  totalWallet: z.number().nullable().default(null),
  totalDistance: z.number(),
  totalDuration: z.number(),
  couponId: z.string().nullable().default(null),
  couponDiscount: z.number().nullable().default(null),
  couponExpiryDate: z.string().nullable().default(null),
  couponDiscountAmount: z.number().nullable().default(null),
});

export type TUbookingDetailValidator = z.infer<typeof BookingSchema>;
export type TBookingAddressDetailAndTimeValidator = z.infer<
  typeof BookingAddressDetailAndTimeSchema
>;
export type TPassengerAndPackageDetailValidator = z.infer<
  typeof PassengerAndPackageDetailSchema
>;
export type TAddressSchema = z.infer<typeof addressSchema>;
