"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Target } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import { LinkPending } from "@/components/link-pending";
import type { CategoryPlanGroup } from "@/lib/actions/my-subscriptions.action";
import { catMeta } from "./category-meta";

// Left column of the pricing page: a global 180/365 toggle over a list of
// category plans, plus the one-time single-exam row. The toggle drives every
// row's price + which plan the Select button buys.
export function PricingTable({
  categories,
  singlePrice,
}: {
  categories: CategoryPlanGroup[];
  singlePrice: number;
}) {
  const allDays = [
    ...new Set(categories.flatMap((g) => g.durations.map((d) => d.durationDays))),
  ].sort((a, b) => a - b);
  const [days, setDays] = useState(allDays.at(-1) ?? 365);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl">Category plans</h2>
        {allDays.length > 1 && (
          <div className="flex items-center gap-1 rounded-full bg-muted p-0.5">
            {allDays.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                aria-pressed={d === days}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:translate-y-px",
                  d === days
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {d} days
              </button>
            ))}
          </div>
        )}
      </div>

      {categories.length > 0 && (
        <Card className="mt-4 divide-y p-0">
          {categories.map((group) => {
            const meta = catMeta(group.category);
            const d =
              group.durations.find((x) => x.durationDays === days) ??
              group.durations.at(-1)!;
            const popular = group.category === "ASSAM_TET";
            return (
              <div
                key={group.category}
                className="flex flex-wrap items-center gap-4 p-5 transition-colors hover:bg-muted/40"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted font-heading text-xs font-semibold">
                  {meta.monogram}
                </div>

                <div className="min-w-40 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-lg leading-tight">
                      {meta.label}
                    </h3>
                    {popular && (
                      <Badge variant="secondary" className="gap-1">
                        <Sparkles className="size-3" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {meta.features.map((f) => (
                      <li key={f} className="flex items-center gap-1">
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="shrink-0">
                  <span className="font-heading text-2xl tabular-nums">
                    ₹{d.price}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    /{d.durationDays}d
                  </span>
                </p>

                <Button
                  className="shrink-0"
                  render={<Link href={`/checkout?plan=${d.planId}`} />}
                >
                  Select
                  <ArrowRight className="size-4" />
                  <LinkPending />
                </Button>
              </div>
            );
          })}
        </Card>
      )}

      {/* one-time single exam — no toggle, flat price, buy from a test's page */}
      <Card className="mt-4 flex flex-wrap items-center gap-4 border-dashed p-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Target className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-40 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-lg leading-tight">Single exam</h3>
            <Badge variant="outline">One-time</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Buy access to one full-length mock test. No subscription needed.
          </p>
        </div>
        <p className="shrink-0">
          <span className="font-heading text-2xl tabular-nums">
            ₹{singlePrice}
          </span>
          <span className="text-xs text-muted-foreground"> /exam</span>
        </p>
        <Button
          variant="secondary"
          className="shrink-0"
          render={<Link href="/all-test-series" />}
        >
          Buy
          <ArrowRight className="size-4" />
          <LinkPending />
        </Button>
      </Card>
    </div>
  );
}
