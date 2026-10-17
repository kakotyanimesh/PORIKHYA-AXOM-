"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { auth, APIError } from "@repo/auth";
import { getCurrentUser } from "@/lib/utils/current-user";

export async function getAccountPageData() {
  return getCurrentUser();
}

export async function updateProfile(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/account?profile_error=Name+can%27t+be+empty");

  const requestHeaders = await headers();
  try {
    await auth.api.updateUser({ headers: requestHeaders, body: { name } });
  } catch (error) {
    if (error instanceof APIError) {
      redirect(`/account?profile_error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  const session = await auth.api.getSession({ headers: requestHeaders });
  if (session) revalidateTag(`account:${session.user.id}`, "days");
  redirect("/account?profile_success=1");
}

export async function changePassword(formData: FormData) {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword.length < 8) {
    redirect("/account?password_error=New+password+must+be+at+least+8+characters#password");
  }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: { currentPassword, newPassword, revokeOtherSessions: true },
    });
  } catch (error) {
    if (error instanceof APIError) {
      redirect(`/account?password_error=${encodeURIComponent(error.message)}#password`);
    }
    throw error;
  }
  redirect("/account?password_success=1#password");
}

export async function deleteAccount(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  try {
    await auth.api.deleteUser({ headers: await headers(), body: { password } });
  } catch (error) {
    if (error instanceof APIError) {
      redirect(`/account?delete_error=${encodeURIComponent(error.message)}#danger`);
    }
    throw error;
  }
  redirect("/signin");
}
