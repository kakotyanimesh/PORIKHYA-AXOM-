import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  image: string | null | undefined;
};

// Session lookup remains request-aware. React.cache below deduplicates it only
// within the current render, without persisting an authorization decision.
async function fetchSession() {
  return auth.api.getSession({ headers: await headers() });
}

// Server-side authorization gate for the CMS. Logged-out -> /signin.
// Logged-in but not in ADMIN_EMAILS -> /signin?error=forbidden.
// redirect() stays OUTSIDE the cached fn (react cache dedupes per request).
export const requireAdmin = cache(async (): Promise<AdminUser> => {
  const session = await fetchSession();

  if (!session) {
    redirect("/signin");
  }
  if (!ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    redirect("/signin?error=forbidden");
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };
});
