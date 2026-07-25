import { z } from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_.]+$/, "Username can only contain letters, numbers, underscores, and periods"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(20, "Password must be within 20 letters"),
  phone_number: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
});

export type SignupInput = z.infer<typeof signupSchema>;
