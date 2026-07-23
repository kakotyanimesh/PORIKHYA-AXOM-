import type { ReactNode } from "react";
import Link from "next/link";

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
        <Link href="/" className="font-heading text-lg font-medium">
          Porikhya <span className="text-brand-accent">Axom</span>
        </Link>
        {promo}
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}
