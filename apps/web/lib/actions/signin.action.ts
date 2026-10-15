"use server";

import { auth, APIError } from "@repo/auth";
import { signinSchema, type SigninInput } from "../validations/signin.validation";
import { enforceRateLimit, RateLimitExceededError } from "@/lib/utils/rate-limit";

export type SigninResult = { success: true } | { success: false; error: string };

export async function signin(input: SigninInput): Promise<SigninResult> {
  try {
    await enforceRateLimit({ name: "signin-action", limit: 10, windowSeconds: 60 });
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
  const parsed = signinSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password, rememberMe } = parsed.data;

  try {
    await auth.api.signInEmail({
      body: { email, password, rememberMe },
    });
    return { success: true };
  } catch (error) {
    if (error instanceof APIError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}
