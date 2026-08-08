"use server";

import { auth, APIError } from "@repo/auth";
import { prisma } from "@repo/db";
import { signupSchema, type SignupInput } from "../validations/signup.validation";

export type SignupResult =
  | { success: true }
  | { success: false; error: string; alreadyExists?: boolean };

export async function signup(input: SignupInput): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { username, email, password, phone_number } = parsed.data;

  // Own the duplicate check so the message is clean and no verification mail is
  // sent for an account that already exists. Better Auth's own email-exists path
  // re-sends verification for an unverified account (reads as success + no clear
  // error), and a duplicate phone_number would otherwise surface as a raw Prisma
  // unique violation. The DB unique constraints stay the real guarantee — this
  // is just for a precise, pre-send message.
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: email, mode: "insensitive" } },
        { username: { equals: username, mode: "insensitive" } },
        { phone_number },
      ],
    },
    select: { email: true, username: true, phone_number: true },
  });
  if (existing) {
    const field =
      existing.email.toLowerCase() === email.toLowerCase()
        ? "email"
        : existing.username?.toLowerCase() === username.toLowerCase()
          ? "username"
          : "phone number";
    return {
      success: false,
      alreadyExists: true,
      error: `An account with this ${field} already exists. Please sign in instead.`,
    };
  }

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
