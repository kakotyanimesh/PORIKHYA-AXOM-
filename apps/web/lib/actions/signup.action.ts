"use server";

import { auth, APIError } from "@repo/auth";
import { signupSchema, type SignupInput } from "../validations/signup.validation";

export type SignupResult =
  | { success: true }
  | { success: false; error: string };

export async function signup(input: SignupInput): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { username, email, password, phone_number } = parsed.data;

  try {
    await auth.api.signUpEmail({
      body: {
        name: username,
        username,
        email,
        password,
        phone_number,
      },
    });
    return { success: true };
  } catch (error) {
    if (error instanceof APIError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}
