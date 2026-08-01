import Link from "next/link";
import { ArrowRight, CheckCircle2, Crown } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { LinkPending } from "@/components/link-pending";
import type { PlanOption } from "@/lib/actions/my-subscriptions.action";

const SUPER_FEATURES = [
  "TET, ADRE & Assam Police included",
  "All mocks, notes and PYQ solutions",
  "Priority support",
  "New exams added free",
];

// The all-in bundle — every category in one plan. Shown on its own, styled to
// stand apart from the single-category unlock cards.
export function SuperBundleCard({ plan }: { plan: PlanOption }) {
  return (
    <Card className="relative flex h-full flex-col overflow-hidden p-6">
      {/* soft brand wash top-right — decorative, sits behind content */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-2xl"
      />

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="gap-1">
          <Crown className="size-3.5" />
          Super bundle
        </Badge>
        <span className="font-heading text-lg text-primary">All-in</span>
      </div>

      <h3 className="mt-4 font-heading text-3xl tracking-tight">
        Every Assam exam, one plan.
      </h3>

      <p className="mt-4">
        <span className="font-heading text-4xl tabular-nums">₹{plan.price}</span>
        <span className="text-sm text-muted-foreground">
          {" "}
          / {plan.durationDays} days
        </span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Cheaper than three category plans
      </p>

      <ul className="mt-5 space-y-2 text-sm">
        {SUPER_FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <Button className="w-full" render={<Link href={`/checkout?plan=${plan.id}`} />}>
          Get the Super bundle
          <ArrowRight className="size-4" />
          <LinkPending />
        </Button>
      </div>
    </Card>
  );
}
