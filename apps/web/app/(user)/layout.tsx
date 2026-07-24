import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NavUserServer } from "@/components/nav-user-server";
import { NavUserSkeleton } from "@/components/nav-user";
import { AccountMenuServer } from "@/components/account-menu-server";
import { AccountMenuSkeleton } from "@/components/account-menu";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@repo/ui/components/sidebar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar
        className="hidden md:flex"
        userSlot={
          <Suspense fallback={<NavUserSkeleton />}>
            <NavUserServer />
          </Suspense>
        }
      />
      <SidebarInset>
        <div className="hidden h-14 shrink-0 items-center border-b px-4 md:flex">
          <SidebarTrigger />
        </div>
        <div className="flex-1 pb-24 md:pb-0">{children}</div>
      </SidebarInset>
      <MobileBottomNav
        accountMenu={
          <Suspense fallback={<AccountMenuSkeleton />}>
            <AccountMenuServer />
          </Suspense>
        }
      />
    </SidebarProvider>
  );
}
