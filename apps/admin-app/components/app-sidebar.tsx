import Link from "next/link";
import { NavMain } from "@/components/nav-main";
import { mainNavItems } from "@/components/nav-items";
// mainNavItems used only in the server-rendered skeleton below; NavMain owns
// its own copy (client) so icon fns never cross the RSC boundary.
import { AdminUser, AdminUserSkeleton } from "@/components/admin-user";
import { Logo } from "@repo/ui/components/logo";
import { requireAdmin } from "@/lib/utils/require-admin";
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

function SidebarBrand() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" render={<Link href="/" />}>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-chart-4 font-dottedFont text-white">
              <span className="text-sm font-bold">PA</span>
            </div>
            <Logo className="flex-1 truncate text-base" badge={false} />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

export function AppSidebarSkeleton(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarBrand />
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
        <AdminUserSkeleton />
      </SidebarFooter>
    </Sidebar>
  );
}

export async function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const admin = await requireAdmin();

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarBrand />
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <AdminUser user={admin} />
      </SidebarFooter>
    </Sidebar>
  );
}
