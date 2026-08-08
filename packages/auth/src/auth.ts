import { betterAuth, APIError } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins/username";
import { nextCookies, toNextJsHandler } from "better-auth/next-js";
import { prisma } from "@repo/db";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // block sign-in until the email is proven. Better Auth re-sends the
    // verification mail on a sign-in attempt by an unverified user.
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your Porikhyaaxom email",
        html: `<p>Confirm your email to finish signing up:</p><p><a href="${url}">Verify email</a></p>`,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // User table has no `image` column. Google always maps profile.picture ->
      // image; spread last, so this drops it before the adapter write.
      mapProfileToUser: () => ({ image: undefined }),
    },
  },
  // DB-backed so limits actually hold across serverless instances (in-memory
  // default is useless on Vercel — each cold start gets its own counter).
  // ponytail: adds one DB round-trip per auth request; fine at this scale, move
  // to redis storage only if the rate_limit table shows contention.
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/forget-password": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
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
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      // verification flow is wired now, so keep the default: a Google sign-in
      // only auto-links into an existing local account whose email is verified.
      requireLocalEmailVerified: true,
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
