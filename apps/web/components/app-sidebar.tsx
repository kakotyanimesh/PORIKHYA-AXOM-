"use client";

import * as React from "react";
import Link from "next/link";
import { NavMain } from "@/components/nav-main";
import { mainNavItems } from "@/components/nav-items";
import { Logo } from "@repo/ui/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

export function AppSidebar({
  userSlot,
  ...props
}: React.ComponentProps<typeof Sidebar> & { userSlot: React.ReactNode }) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-sm font-bold">PA</span>
              </div>
              <Logo className="flex-1 truncate text-base" badge={false} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>
      <SidebarFooter>{userSlot}</SidebarFooter>
    </Sidebar>
  );
}
