import type { ReactNode } from "react";
import { Logo } from "@repo/ui/components/logo";

export function AuthShell({
  promo,
  children,
}: {
  promo: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-md md:grid-cols-2">
      <div className="auth-panel hidden flex-col justify-between p-8 md:flex">
        <Logo />
        {promo}
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}
