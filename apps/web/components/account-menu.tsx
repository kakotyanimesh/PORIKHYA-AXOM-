"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@repo/ui/components/dropdown-menu";
import { SparklesIcon, BadgeCheckIcon, LogOutIcon } from "lucide-react";
import { authClient } from "@repo/auth/client";
import { Skeleton } from "@repo/ui/components/skeleton";
import { accountInitials } from "./account-initials";

export type AccountUser = { id: string; name: string; email: string; image?: string | null };

export function AccountMenuSkeleton() {
  return (
    <div className="flex items-center gap-2 px-1 py-1.5">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="grid flex-1 gap-1.5">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export function AccountMenuContent({ user }: { user: AccountUser }) {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/signin");
  }

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
            <Avatar>
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback>{accountInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-start text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem render={<Link href="/upgrade" />}>
          <SparklesIcon />
          Upgrade
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account" />}>
          <BadgeCheckIcon />
          Account
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleLogout}>
        <LogOutIcon />
        Log out
      </DropdownMenuItem>
    </>
  );
}
