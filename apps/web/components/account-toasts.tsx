"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const TOAST_PARAMS = [
  ["profile_error", "error"],
  ["profile_success", "success"],
  ["password_error", "error"],
  ["password_success", "success"],
  ["delete_error", "error"],
] as const;

const MESSAGES: Record<string, string> = {
  profile_success: "Profile updated.",
  password_success: "Password updated.",
};

export function AccountToasts() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let fired = false;
    for (const [key, tone] of TOAST_PARAMS) {
      const value = searchParams.get(key);
      if (!value) continue;
      fired = true;
      toast[tone](MESSAGES[key] ?? value);
    }
    if (fired) router.replace(pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
