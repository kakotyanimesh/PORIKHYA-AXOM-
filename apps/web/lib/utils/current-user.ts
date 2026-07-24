import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import type { AccountUser } from "@/components/account-menu";

export const getCurrentUser = cache(async (): Promise<AccountUser> => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/signin");
  }

  return {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };
});
