import { z } from "zod";

export const PaymentRequestSchema = z.object({
  userSearch: z.string(),
  amount: z
    .number()
    .positive("Amount must be greater than zero.") // Ensuring it's a positive number
    .refine((val) => val > 0, { message: "Amount must be greater than zero." }),
  onAccountOf: z.string().min(1, "On account of field cannot be empty."),
  remarks: z.string(),
});
export type TPaymentRequestSchema = z.infer<typeof PaymentRequestSchema>;

export const TransferMoneySchema = z.object({
  userSearch: z
    .string()
    .refine((val) => val.length <= 30, {
      message: "String can't be more than 30 characters",
    })
    .refine((val) => val.length > 5, {
      message: "String can't be less than 6 characters",
    }),
  amount: z
    .number()
    .positive("Amount must be greater than zero.") // Ensuring it's a positive number
    .refine((val) => val > 0, { message: "Amount must be greater than zero." }),
  narration: z.string().optional(),
});
export type TTransferMoneySchema = z.infer<typeof TransferMoneySchema>;

export const TopupSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than zero.") // Ensuring it's a positive number
    .refine((val) => val > 0, { message: "Amount must be greater than zero." }),
});
export type TTopupSchema = z.infer<typeof TopupSchema>;

export const WithDrawSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than zero.") // Ensuring it's a positive number
    .refine((val) => val > 0, { message: "Amount must be greater than zero." }),
});
export type TWithDrawSchema = z.infer<typeof WithDrawSchema>;

export const ContactFormSchema = z.object({
  name: z.string().min(1, "Name field cannot be empty."),
  email: z
    .string()
    .email("Email is not valid")
    .min(1, "Email field cannot be empty."),
  phone_number: z.string().min(1, "Phone number field cannot be empty."),
  reason: z.string().min(1, "Reason field cannot be empty."),
  initialMessage: z.string().optional(),
});
export type TContactFormSchema = z.infer<typeof ContactFormSchema>;

export const RemoveAccountFormSchema = z.object({
  email: z
    .string()
    .email("Email is not valid")
    .min(1, "Email field cannot be empty."),
  // otp: z.string(),
});
export type TRemoveAccountFormSchema = z.infer<typeof RemoveAccountFormSchema>;

export const RemoveAccountOTPSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});
export type TRemoveAccountOTPSchema = z.infer<typeof RemoveAccountOTPSchema>;
