import { LayoutDashboardIcon, ClipboardListIcon, CreditCardIcon, BookOpenIcon, type LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export const mainNavItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
  { title: "All Test Series", url: "/all-test-series", icon: ClipboardListIcon },
  { title: "My Subscriptions", url: "/my-subscriptions", icon: CreditCardIcon },
  { title: "Previous Year Papers", url: "/previous-year-papers", icon: BookOpenIcon },
];
