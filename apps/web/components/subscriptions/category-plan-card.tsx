"use client";

import { useState } from "react";
import { CheckCircle2, Zap } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { BuyPlanButton } from "@/components/checkout/buy-plan-button";
import type { CategoryPlanGroup } from "@/lib/actions/my-subscriptions.action";
import { catMeta } from "./category-meta";

// One category, its durations behind a toggle. Default to the longest (best
// value) — the toggle picks which plan the Select button buys.
export function CategoryPlanCard({ group }: { group: CategoryPlanGroup }) {
  const meta = catMeta(group.category);
  const durations = group.durations;
  const [selected, setSelected] = useState(durations.length - 1);
  const active = durations[selected] ?? durations[0]!;

  return (
    <Card className="flex h-full flex-col p-6 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted font-heading text-xs font-semibold">
            {meta.monogram}
          </div>
          <div>
            <h3 className="font-heading text-lg leading-tight">{meta.label}</h3>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Category plan
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          <Zap className="size-3" />
          Unlock
        </span>
      </div>

      <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        {meta.features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        <div className="flex items-end justify-between gap-3 border-t pt-4">
          <p>
            <span className="font-heading text-3xl tabular-nums">
              ₹{active.price}
            </span>
            <span className="text-sm text-muted-foreground">
              {" "}
              /{active.durationDays}d
            </span>
          </p>
          {durations.length > 1 && (
            <div className="flex items-center gap-1 rounded-full bg-muted p-0.5">
              {durations.map((d, i) => (
                <button
                  key={d.planId}
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-pressed={i === selected}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:translate-y-px",
                    i === selected
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {d.durationDays}d
                </button>
              ))}
            </div>
          )}
        </div>

        <BuyPlanButton planId={active.planId} className="mt-4 w-full">
          Select
        </BuyPlanButton>
      </div>
    </Card>
  );
}
