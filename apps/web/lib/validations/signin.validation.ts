import { z } from "zod";

export const signinSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export type SigninInput = z.infer<typeof signinSchema>;
