import Link from "next/link";
import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { Logo } from "@repo/ui/components/logo";
import { Skeleton } from "@repo/ui/components/skeleton";

function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex justify-center p-6">
        <Link href="/">
          <Logo className="text-base" />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        {children}
      </main>
    </div>
  );
}

function AuthLoading() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto grid min-h-[28rem] w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-md md:grid-cols-2"
    >
      <Skeleton className="hidden rounded-none md:block" />
      <div className="flex flex-col gap-6 p-8">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

async function AuthSessionGate({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");

  return children;
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <AuthFrame>
          <AuthLoading />
        </AuthFrame>
      }
    >
      <AuthFrame>
        <AuthSessionGate>{children}</AuthSessionGate>
      </AuthFrame>
    </Suspense>
  );
}
