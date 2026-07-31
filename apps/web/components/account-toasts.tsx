"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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

  useEffect(() => {
    let fired = false;
    for (const [key, tone] of TOAST_PARAMS) {
      const value = searchParams.get(key);
      if (!value) continue;
      fired = true;
      toast[tone](MESSAGES[key] ?? value);
    }
    // strip the one-shot query params without a client navigation (no page
    // flash, no re-fetch) — we never wanted to route, only clean the URL
    if (fired) window.history.replaceState(null, "", pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
