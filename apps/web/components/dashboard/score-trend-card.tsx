"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { Card } from "@repo/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/components/chart";
import { cn } from "@repo/ui/lib/utils";
import type { DashboardAttempt } from "@/lib/actions/dashboard.action";

type RangeKey = "1W" | "1M" | "3M" | "All";

const RANGE_DAYS: Record<RangeKey, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  All: Infinity,
};

const chartConfig = {
  percentage: { label: "Score", color: "var(--foreground)" },
} satisfies ChartConfig;

const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

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
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                range === key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {data.length > 0 ? (
        <ChartContainer config={chartConfig} className="mt-6 h-64 w-full">
          <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              className="text-xs"
            />
            <YAxis hide domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="percentage"
              type="monotone"
              stroke="var(--foreground)"
              strokeWidth={2}
              fill="url(#scoreFill)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="mt-6 flex h-64 items-center justify-center text-sm text-muted-foreground">
          No attempts in this range.
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
