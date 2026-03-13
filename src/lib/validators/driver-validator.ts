import { z } from 'zod';

export const DriverSchema = z.object({
  nationalInsuranceNumber: z
    .string()
    .min(6, 'National Insurance Number must be 6 digit long'),
  selfAssessmentTaxId: z.string().min(6, 'Self Assessment Tax Id must be 6 digit long'),
  dateOfBirth: z.string(),
  bio: z.string().optional(),
  hobby: z.string().optional(),
  profileImage: z.unknown().optional(),
});

export type TDriverSchemaValidator = z.infer<typeof DriverSchema>;
