"use client";

import { useLinkStatus } from "next/link";
import { Loader2Icon } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

export function LinkPending({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Loader2Icon className={cn("size-4 animate-spin", className)} />;
}



export function LinkPendingIcon({
    icon: Icon,
    className,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    className?: string;
  }) {
    const { pending } = useLinkStatus();
    const IconToShow = pending ? Loader2Icon : Icon;
    return <IconToShow className={cn(className, pending && "animate-spin")} />;
  }

