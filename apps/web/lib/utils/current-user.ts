import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import type { AccountUser } from "@/components/account-menu";

async function fetchSession() {
  return auth.api.getSession({ headers: await headers() });
}

export const getCurrentUser = cache(async (): Promise<AccountUser> => {
  const session = await fetchSession();

  if (!session) {
    redirect("/signin");
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };
});
