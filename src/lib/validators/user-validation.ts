import { z } from "zod";

export const UserSchema = z
  .object({
    firstName: z.string().min(2, "Must be min 2 characters long"),
    lastName: z.string().min(2, "Must be min 2 characters long"),
    phone_number: z.string().min(9, "Phone number is required"),
    emailAddress: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Invalid email address" }),
    password: z
      .string()
      .trim()
      .min(8, "Must be min 8 characters long")
      .refine(
        (password) => {
          const hasUpperCase = /[A-Z]/.test(password);
          const hasLowerCase = /[a-z]/.test(password);
          const hasNumber = /[0-9]/.test(password);
          const hasSpecialChar = /[!@#$%^&*()-=_+[\]{};':"\\|,.<>/?]/.test(
            password
          );
          return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
        },
        {
          message:
            "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special letter",
        }
      ),
    confirmPassword: z.string().trim(),
  })
  .refine(
    (values) => {
      return values.password === values.confirmPassword;
    },
    {
      message: "Passwords must match!",
      path: ["confirmPassword"],
    }
  );

export type TUserCredentialsValidator = z.infer<typeof UserSchema>;

export const UpdateUserValidator = z.object({
  firstName: z.string().min(2, "Must be min 2 characters long"),
  lastName: z.string().min(2, "Must be min 2 characters long"),
  phone_number: z.string().min(9, "Phone number is required"),
});

export type TUpdateUserValidator = z.infer<typeof UpdateUserValidator>;
