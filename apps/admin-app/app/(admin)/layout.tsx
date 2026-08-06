import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/utils/require-admin";

// Sync layout so the shell prerenders. All per-request auth (headers()) lives
// inside Suspense boundaries below — required by Next 16 cacheComponents, else
// the whole route blocks at prerender.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link href="/" className="font-heading text-lg font-medium">
          porikhyaaxom admin
        </Link>
        <Suspense fallback={null}>
          <AdminEmail />
        </Suspense>
      </header>
      <main className="flex-1 p-6">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </div>
  );
}

// Authorization gate — runs before children render, redirects non-admins.
async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

async function AdminEmail() {
  const admin = await requireAdmin(); // cache()'d — shares the read with AdminGate
  return <span className="text-sm text-muted-foreground">{admin.email}</span>;
}
