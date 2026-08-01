import { CheckIcon } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import { BuyPlanButton } from "@/components/checkout/buy-plan-button";
import type { SeriesPackPlan } from "@/lib/actions/all-test-series.action";

// One duration of a series pack. `highlighted` gives the best-value plan a ring
// + badge so the eye lands on it first (Emil: guide the choice, don't flatten it).
export function PackPlanCard({
  plan,
  seriesName,
  highlighted,
  savingsPct,
}: {
  plan: SeriesPackPlan;
  seriesName: string;
  highlighted?: boolean;
  savingsPct?: number;
}) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col p-6 transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:shadow-secondary motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        highlighted && "ring-2 ring-primary",
      )}
    >
      {highlighted && (
        <Badge className="absolute right-4 top-4">
          {savingsPct && savingsPct > 0 ? `Save ${savingsPct}%` : "Best value"}
        </Badge>
      )}

      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {plan.durationDays >= 365 ? "1 year" : `${plan.durationDays} days`} pass
      </p>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-heading text-4xl tabular-nums">₹{plan.price}</span>
        <span className="text-sm text-muted-foreground">
          / {plan.durationDays} days
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground tabular-nums">
        ≈ ₹{Math.round(plan.price / plan.durationDays)} per day
      </p>

      <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <CheckIcon className="size-4 shrink-0 text-primary" />
          Every test in {seriesName}
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon className="size-4 shrink-0 text-primary" />
          Valid for {plan.durationDays} days
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon className="size-4 shrink-0 text-primary" />
          Detailed solutions &amp; analytics
        </li>
      </ul>

      <div className="mt-6">
        <BuyPlanButton planId={plan.id}>Buy for ₹{plan.price}</BuyPlanButton>
      </div>
    </Card>
  );
}
