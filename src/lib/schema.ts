import { z } from 'zod';

export const bookingSchema = z.object({
  id: z.string(),
  paymentType: z.string(),
  status: z.string(),
  packageName: z.string(),
  isAllowGenerateInvoice: z.boolean().optional(),
});

export const requestSchema = z.object({
  id: z.string(),
  paymentType: z.string(),
  status: z.string(),
  packageInfo: z
    .union([
      z.string(),
      z.object({ name: z.string() }).passthrough(),
    ])
    .optional(),
  startFrom: z
    .union([
      z.string(),
      z.object({ postCode: z.string(), city: z.string() }).passthrough(),
    ])
    .optional(),
  destination: z
    .union([
      z.string(),
      z.object({ postCode: z.string(), city: z.string() }).passthrough(),
    ])
    .optional(),
  totalBill: z.number().optional(),
  isAllowGenerateInvoice: z.boolean().optional(),
})

export type booking = z.infer<typeof bookingSchema>;
export type request = z.infer<typeof requestSchema>;
