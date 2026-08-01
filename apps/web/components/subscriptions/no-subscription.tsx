import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { LinkPending } from "@/components/link-pending";

const PERKS = [
  "Every mock in the category",
  "Detailed solutions",
  "Score & weak-topic analytics",
];

// Shown when the user holds no active plan. Editorial, not a centered-icon
// placeholder — reads like the rest of the app and points straight at the
// series where a plan gets unlocked.
export function NoSubscription({ fromPrice }: { fromPrice?: number }) {
  return (
    <Card className="p-8 sm:p-10">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Get started
      </p>
      <h2 className="mt-3 font-heading text-3xl tracking-tight sm:text-4xl">
        No plan yet.{" "}
        <span className="text-muted-foreground italic">Let&apos;s fix that.</span>
      </h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Unlock a category and every mock in it opens at once — timed,
        negative-marked, with solutions and analytics.
        {fromPrice ? ` Plans start at ₹${fromPrice}.` : ""}
      </p>

      <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {PERKS.map((p) => (
          <li key={p} className="flex items-center gap-2 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            {p}
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap items-center gap-2">
        <Button render={<Link href="/all-test-series" />}>
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
