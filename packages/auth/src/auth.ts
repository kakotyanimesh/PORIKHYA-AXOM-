import { betterAuth, APIError } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins/username";
import { nextCookies, toNextJsHandler } from "better-auth/next-js";
import { prisma } from "@repo/db";
import { sendEmail, renderVerificationEmail } from "./email";

const configuredOrigins = [
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  // Local development and the current Vercel deployment.
  "http://localhost:3000",
  "https://porikhyaaaxom.vercel.app",
].filter(
  (origin): origin is string =>
    typeof origin === "string" && !origin.includes("your-prod-domain"),
);

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  trustedOrigins: configuredOrigins,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Temporarily disabled while no production mail sender is configured.
    requireEmailVerification: false,
  },
  emailVerification: {
    // Keep the verification templates and transport wired for later, but don't
    // send mail until EMAIL_VERIFICATION_ENABLED=true.
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (process.env.EMAIL_VERIFICATION_ENABLED !== "true") return;
      const { html, text } = renderVerificationEmail({ name: user.name, url });
      await sendEmail({
        to: user.email,
        subject: "Verify your PorikhyaAxom email",
        html,
        text,
      });
    },
  },
  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            // User table has no `image` column. Google always maps profile.picture ->
            // image; spread last, so this drops it before the adapter write.
            mapProfileToUser: () => ({ image: undefined }),
          },
        },
      }
    : {}),
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
      "/send-verification-email": { window: 60, max: 2 },
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
