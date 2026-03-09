import * as Yup from "yup";

export const addressSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  latitude: Yup.string().required("latitude is required"),
  longitude: Yup.string().required("longitude is required"),
  postCode: Yup.string(),
  houseNumber: Yup.string(),
  streetName: Yup.string(),
  city: Yup.string(),
});

export const BookingRequestSchema = Yup.object().shape({
  bookingDate: Yup.string().required("Date is required"),
  bookingTime: Yup.string().required("Time is required"),
  totalLuggage: Yup.number().default(0),
  totalPersons: Yup.number().default(1),
  notes: Yup.string().nonNullable(),
  startFrom: addressSchema,
  destination: addressSchema,
  packageId: Yup.string().required("Package is required"),
  passengerId: Yup.string().required("Passenger is required"),
  stoppages: Yup.array(),
  couponCode: Yup.string(),
  couponPercentage: Yup.number(),
  couponExpiryDate: Yup.date()
    .nullable()
    .transform((value, originalValue) =>
      originalValue ? new Date(originalValue) : null
    )
    .typeError("Invalid date format"),
  clientName: Yup.string().required().min(1, "Client name is Required"),
  clientPhone: Yup.string().required().min(9, "Phone number is required"),
  clientEmail: Yup.string().email().required("Invalid email address"),
  totalDistance: Yup.number().default(0),
  totalDuration: Yup.number().default(0),
  cashCollected: Yup.number().default(0),
  walletCollected: Yup.number().default(0),
  discountAmount: Yup.number().default(0),
  serviceCharge: Yup.number().default(0),
  totalBill: Yup.number().default(0),
});

export const defaultAddress = {
  name: "",
  description: "",
  latitude: "",
  longitude: "",
  postCode: "",
  houseNumber: "",
  streetName: "",
  city: "",
};

export const DefaultRequestValues = {
  bookingDate: "",
  bookingTime: "",
  startFrom: defaultAddress,
  destination: defaultAddress,
  stoppages: [],
  totalLuggage: 0,
  totalPersons: 1,
  notes: "",
  couponCode: "",
  couponPercentage: 0,
  couponExpiryDate: null,
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  totalDistance: 0,
  totalDuration: 0,
  paymentType: "",
  requestType: "",
  serviceCharge: 0,
  cashCollected: 0,
  walletCollected: 0,
  discountAmount: 0,
};

export type BookingRequestForm = Yup.InferType<typeof BookingRequestSchema>;
