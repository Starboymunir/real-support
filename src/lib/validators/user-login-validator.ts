import { z } from 'zod';

export const LoginFromSchema = z.object({
  emailAddress: z.string().email(),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long.',
  }),
});
export type TLoginValidator = z.infer<typeof LoginFromSchema>;


export const ForgotFromSchema = z.object({
  email_address: z.string().email(),
});
export type TForgotValidator = z.infer<typeof ForgotFromSchema>;


export const NewPasswordFromSchema = z.object({
  emailCode: z.string(),
  password: z.string().trim().min(8, {
    message: 'Password must be at least 8 characters long.',
  }),
  confirmPassword: z.string().trim(),
}).refine(
  (values) => {
    return values.password === values.confirmPassword;
  },
  {
    message: "Passwords must match!",
    path: ["confirmPassword"],
  }
);

export type TNewPasswordValidator = z.infer<typeof NewPasswordFromSchema>;

export const ConfirmEmailFromSchema = z.object({
  emailCode: z.string(),
});
export type TConfirmEmailValidator = z.infer<typeof ConfirmEmailFromSchema>;

