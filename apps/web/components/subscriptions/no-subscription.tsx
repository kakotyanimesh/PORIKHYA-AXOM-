import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { LinkPending } from "@/components/link-pending";

// Shown when the user holds no active plan. Not a dead end — points them
// straight at the test series where they can unlock what they need.
export function NoSubscription() {
  return (
    <Card className="relative flex flex-col items-center overflow-hidden p-10 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl"
      />
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <Sparkles className="size-6 text-muted-foreground" />
      </div>
      <h2 className="mt-5 font-heading text-2xl tracking-tight">
        No active subscription
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        You haven&apos;t unlocked a plan yet. Browse the test series and unlock a
        category to start practising — access begins the moment you pay.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button render={<Link href="/all-test-series" />}>
          <BookOpen className="size-4" />
          Browse test series
          <ArrowRight className="size-4" />
          <LinkPending />
        </Button>
        <Button variant="outline" render={<Link href="/upgrade" />}>
          Compare all plans
          <LinkPending />
        </Button>
      </div>
    </Card>
  );
}
