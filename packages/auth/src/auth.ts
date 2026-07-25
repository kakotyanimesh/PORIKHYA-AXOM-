import { betterAuth, APIError } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins/username";
import { nextCookies, toNextJsHandler } from "better-auth/next-js";
import { prisma } from "@repo/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    additionalFields: {
      phone_number: {
        type: "string",
        required: true,
        input: true,
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  session: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      userId: "user_id",
    },
  },
  account: {
    // ponytail: no email verification flow yet, so this trusts email/password
    // signups without proof of email ownership — an attacker could
    // pre-register a victim's email, then inherit the victim's later Google
    // sign-in into the same account. Revisit before real users sign up: wire
    // emailVerification.sendVerificationEmail, then drop
    // requireLocalEmailVerified back to its default (true).
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  plugins: [
    username({
      schema: {
        user: {
          fields: {
            displayUsername: "display_username",
          },
        },
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export { APIError, toNextJsHandler };
