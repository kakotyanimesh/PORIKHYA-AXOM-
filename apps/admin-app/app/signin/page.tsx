import { Suspense } from "react";
import { AdminSigninForm } from "@/components/admin-signin-form";

export default function SigninPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-4">
        {/* searchParams is uncached/dynamic — keep it in Suspense so the page
            shell still prerenders under cacheComponents. */}
        <Suspense fallback={null}>
          <ForbiddenBanner searchParams={searchParams} />
        </Suspense>
        <AdminSigninForm />
      </div>
    </main>
  );
}

async function ForbiddenBanner({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (error !== "forbidden") return null;
  return (
    <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      That account is not an admin. Ask for access, then sign in again.
    </p>
  );
}
