"use client";

import { useLinkStatus } from "next/link";
import { Loader2Icon } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

export function LinkPending({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Loader2Icon className={cn("size-4 animate-spin", className)} />;
}
