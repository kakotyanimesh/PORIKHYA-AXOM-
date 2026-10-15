import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // An unset or placeholder URL should resolve against the current web app
  // origin. This is especially useful on Vercel preview deployments.
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL &&
    !process.env.NEXT_PUBLIC_BETTER_AUTH_URL.includes("your-prod-domain")
      ? process.env.NEXT_PUBLIC_BETTER_AUTH_URL
      : undefined,
  plugins: [usernameClient()],
});

export const googleAuthEnabled = Boolean(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
);

export const { signIn, signUp, signOut, useSession } = authClient;
