"use client";

import Link, { useLinkStatus } from "next/link";

import { usePathname } from "next/navigation";
import { LazyMotion, domMax, m } from "motion/react";
import { UserIcon, Loader2Icon } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { mainNavItems } from "./nav-items";

const PILL_TRANSITION = {
  type: "spring",
  stiffness: 500,
  damping: 32,
} as const;

function Pill({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  return (
    <m.span
      layoutId="mobile-nav-pill"
      className="absolute inset-0 rounded-full bg-accent"
      transition={PILL_TRANSITION}
    />
  );
}

function NavIcon({
  icon: Icon,
}: {
  icon: React.ComponentType<{ className?: string }>;
}) {
  const { pending } = useLinkStatus();
  const IconToShow = pending ? Loader2Icon : Icon;
  return <IconToShow className={cn("size-5", pending && "animate-spin")} />;
}

function TabContent({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "relative z-10 flex flex-col items-center gap-0.5",
        isActive
          ? "font-medium text-accent-foreground"
          : "text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function MobileBottomNavSkeleton() {
  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-1 rounded-full border bg-card p-1.5 shadow-lg md:hidden">
      {mainNavItems.map((item) => (
        <div
          key={item.title}
          className="relative flex flex-col items-center justify-center rounded-full px-3 py-2 text-[11px]"
        >
          <TabContent isActive={false}>
            <item.icon className="size-5" />
          </TabContent>
        </div>
      ))}
      <div className="relative flex flex-col items-center justify-center rounded-full px-3 py-2 text-[11px]">
        <TabContent isActive={false}>
          <UserIcon className="size-5" />
        </TabContent>
      </div>
    </nav>
  );
}

export function MobileBottomNav({
  accountMenu,
}: {
  accountMenu: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <LazyMotion features={domMax}>
      <nav className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-1 rounded-full border bg-card p-1.5 shadow-lg md:hidden">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.title}
              href={item.url}
              className="relative flex flex-col items-center justify-center rounded-full px-3 py-2 text-[11px] outline-none"
            >
              <Pill isActive={isActive} />
              <TabContent isActive={isActive}>
                <NavIcon icon={item.icon} />
                {isActive && <span className="truncate">{item.title}</span>}
              </TabContent>
            </Link>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex flex-col items-center justify-center rounded-full px-3 py-2 text-[11px] outline-none">
            <Pill isActive={pathname === "/account"} />
            <TabContent isActive={pathname === "/account"}>
              <UserIcon className="size-5" />
              {pathname === "/account" && <span>Profile</span>}
            </TabContent>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="end"
            className="min-w-56 rounded-lg"
          >
            {accountMenu}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </LazyMotion>
  );
}
