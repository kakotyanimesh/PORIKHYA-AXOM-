import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NavUserServer } from "@/components/nav-user-server";
import { NavUserSkeleton } from "@/components/nav-user";
import { AccountMenuServer } from "@/components/account-menu-server";
import { AccountMenuSkeleton } from "@/components/account-menu";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <SidebarInset className="relative">
        <SidebarTrigger className="absolute left-4 top-4 z-10 hidden md:flex" />
        <div className="mx-auto w-full max-w-6xl flex-1 pl-4 pr-4 pt-6 pb-24 sm:pt-8 md:pb-5">
          {children}
        </div>
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
