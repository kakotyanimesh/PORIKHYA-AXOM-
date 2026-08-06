import { Suspense } from "react";
import { AppSidebar, AppSidebarSkeleton } from "@/components/app-sidebar";
import { requireAdmin } from "@/lib/utils/require-admin";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";

// Sync layout so the shell prerenders. All per-request auth (headers()) lives
// inside Suspense boundaries below — required by Next 16 cacheComponents, else
// the whole route blocks at prerender.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Suspense fallback={<AppSidebarSkeleton />}>
        <AppSidebar />
      </Suspense>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center px-4">
          <SidebarTrigger />
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10">
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Loading…</p>
            }
          >
            <AdminGate>{children}</AdminGate>
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Authorization gate — runs before children render, redirects non-admins.
async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
