"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type { DashboardAttempt } from "@/lib/actions/dashboard.action";

// recharts is heavy and browser-only — load the chart on demand so it stays out
// of the initial dashboard bundle (fallback sized to the chart to avoid layout
// shift)
const ScoreTrendChart = dynamic(
  () => import("./score-trend-chart").then((m) => m.ScoreTrendChart),
  { ssr: false, loading: () => <div className="mt-6 h-40 w-full" /> },
);

type RangeKey = "1W" | "1M" | "3M" | "All";

const RANGE_DAYS: Record<RangeKey, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  All: Infinity,
};

// explicit timeZone so server (UTC) and browser (user's TZ) format the same
// day — without it a date near midnight renders differently and hydration
// mismatches. App audience is Assam/India, so pin to IST.
const monthDay = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "Asia/Kolkata",
});

export function ScoreTrendCard({
  attempts,
  lastAttempt,
}: {
  attempts: DashboardAttempt[]; // newest first
  lastAttempt: { name: string; percentage: number; delta: number | null } | null;
}) {
  const [range, setRange] = useState<RangeKey>("1M");

  // attempts arrive newest-first; chart wants chronological
  const data = useMemo(() => {
    const cutoff =
      RANGE_DAYS[range] === Infinity
        ? 0
        : Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000;
    return [...attempts]
      .filter((a) => a.completedAt.getTime() >= cutoff)
      .reverse()
      .map((a) => ({
        label: monthDay.format(a.completedAt),
        percentage: Math.round(a.percentage),
      }));
  }, [attempts, range]);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Score Trend
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="font-heading text-5xl font-medium tabular-nums">
              {lastAttempt ? `${Math.round(lastAttempt.percentage)}%` : "—"}
            </span>
            {lastAttempt?.delta != null && (
              <DeltaBadge delta={lastAttempt.delta} />
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {lastAttempt ? `Last attempt · ${lastAttempt.name}` : "No attempts yet"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-muted p-1">
          {(Object.keys(RANGE_DAYS) as RangeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-[color,background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-95",
                range === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {data.length > 1 ? (
        <ScoreTrendChart data={data} />
      ) : (
        <div className="mt-6 flex h-40 items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {data.length === 0
            ? "No attempts in this range."
            : "One attempt so far — your trend line appears after the next test."}
        </div>
      )}
    </Card>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  const up = delta >= 0;
  const rounded = Math.round(Math.abs(delta) * 10) / 10;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
        up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
      )}
    >
      {up ? "↗" : "↘"} {up ? "+" : "−"}
      {rounded}
    </span>
  );
}
