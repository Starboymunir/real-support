import { z } from "zod";

export const CarValidator = z.object({
  color: z.string().min(1, "color is required"),
  engine: z.string().min(1, "engine is required"),
  make: z.string().min(1, "make is required"),
  model: z.string().min(1, "model is required"),
  year: z.string().min(1, "year is required"),
  numberPlate: z.string().min(1, "number plate is required"),
});

export const MOTDocumentValidator = z.object({
  motDoc: z.unknown(),
  motPassDate: z.string().min(1, "M.O.T pass date is required"),
});

export const InsuranceDocumentValidator = z.object({
  insuranceDoc: z.unknown(),
  insuranceExpiryDate: z.string().min(1, "Insurance expiry date is required"),
});

export const PCOVehicleLicenseValidator = z.object({
  pcoVehicleLicenseDoc: z.unknown(),
  pcoVehicleLicenseExpiryDate: z.string().min(1, "Pco vehicle expiry date is required"),
});

export const VehicleLogBookValidator = z.object({
  vehicleLogBookDoc: z.unknown(),
});

export type TVehicleLogBookValidator = z.infer<typeof VehicleLogBookValidator>;
export type TPCOVehicleLicenseValidator = z.infer<typeof PCOVehicleLicenseValidator>;
export type TInsuranceDocumentValidator = z.infer<typeof InsuranceDocumentValidator>;
export type TMOTDocumentValidator = z.infer<typeof MOTDocumentValidator>;
export type TCarValidator = z.infer<typeof CarValidator>;

