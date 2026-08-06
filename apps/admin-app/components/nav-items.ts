import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  CreditCardIcon,
  UploadIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export const mainNavItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboardIcon },
  { title: "Exams", url: "/exams", icon: ClipboardListIcon },
  { title: "Plans", url: "/plans", icon: CreditCardIcon },
  { title: "Import", url: "/import", icon: UploadIcon },
];
