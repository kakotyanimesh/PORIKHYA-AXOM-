import { Suspense } from "react";
import { AppSidebar, AppSidebarSkeleton } from "@/components/app-sidebar";
import { requireAdmin } from "@/lib/utils/require-admin";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";

// Authorization gate. requireAdmin() redirects non-admins BEFORE children
// render, so no admin content ever streams to an unauthorized (but logged-in)
// user — proxy.ts only checks cookie presence, not the ADMIN_EMAILS allowlist.
// Sitting inside <Suspense> keeps the private-cached session read out of the
// static prerender (cacheComponents). cache()-deduped with AppSidebar.
async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

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
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-8 sm:pt-8">
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
              </div>
            }
          >
            <AdminGate>{children}</AdminGate>
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
