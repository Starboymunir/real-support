import { z } from "zod";

export const accountDocumentsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  sortCode: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(6, "Account number is required"),
  accProfDoc: z.unknown(),
});

export const LicenseDocumentsSchema = z.object({
  LicenseNumber: z.string().min(5, "License number must be 5 digit long"),
  LicenseExpiryDate: z.string().min(1, "License expiry date is required"),
  LicenseDocFront: z.unknown(),
  LicenseDocBack: z.unknown(),
});

export const pcoDocumentsSchema = z.object({
  pcoBadgeNumber: z.string().min(1, "P.C.O badge number is required"),
  pcoBadgeExpiryDate: z.string().min(1, "P.C.O bedge expiry date is required"),
  pcoBadgeDocFront: z.unknown(),
  pcoBadgeDocBack: z.unknown(),
  pcoPaperDoc: z.unknown(),
});

export const passportDocumentsSchema = z.object({
  passportNumber: z.string().min(1, "Passport number is required"),
  passportExpiryDate: z.string().min(1, "Passport expiry date is required"),
  passportDocFront: z.unknown(),
  passportDocBack: z.unknown(),
});

export const addressProfDocumentsSchema = z.object({
  addressProfDoc: z.unknown(),
  houseNumber: z.string().min(1, "House Number date is required"),
  state: z.string().min(1, "state is required"),
  addressCode: z.string().min(1, "Zip Code/Postal Code  is required"),
  streetAddress: z.string().min(1, "Street Address  is required"),
  city: z.string().min(1, "city  is required"),
});
export const workPermitCodeSchema = z.object({
  workPermitCode: z.string(),
});

export type TworkPermitCodeSchemaValidator = z.infer<
  typeof workPermitCodeSchema
>;
export type TAccountDocumentValidator = z.infer<typeof accountDocumentsSchema>;
export type TLicenseDocumentValidator = z.infer<typeof LicenseDocumentsSchema>;
export type TPcoDocumentValidator = z.infer<typeof pcoDocumentsSchema>;
export type TPassportDocumentValidator = z.infer<
  typeof passportDocumentsSchema
>;
export type TAddressProfDocumentValidator = z.infer<
  typeof addressProfDocumentsSchema
>;

export const DriverDocumetLegalInfoValidator = z.object({
  sortCode: z.number().min(6, "Sort code must be 6 digit long"),
  bankName: z.string().min(1, "Bank name is required"),
  LicenseExpiryDate: z.string().min(1, "License expiry date is required"),
  pcoBadgeExpiryDate: z.string().min(1, "P.C.O Bedge expiry date is required"),
  passportExpiryDate: z.string().min(1, "Passport expiry date is required"),
  accountNumber: z.number().min(6, "Account number must be 6 digit long"),
  workPermitCode: z.string().min(1, "Work permit code is required"),
  pcoBadgeNumber: z.string().min(1, "P.C.O badge number is required"),
});
export type TDriverDocumetLegalInfoValidator = z.infer<
  typeof DriverDocumetLegalInfoValidator
>;
