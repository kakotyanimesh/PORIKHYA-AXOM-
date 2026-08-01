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
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import { NavUserSkeleton } from "@/components/nav-user";

export function AppSidebarSkeleton({ className }: { className?: string }) {
  return (
    <Sidebar variant="inset" collapsible="icon" className={className}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-sm font-bold">PA</span>
              </div>
              <Logo className="flex-1 truncate text-base" badge={false} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title}>
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUserSkeleton />
      </SidebarFooter>
    </Sidebar>
  );
}

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
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg font-dottedFont text-white  bg-chart-4">
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
