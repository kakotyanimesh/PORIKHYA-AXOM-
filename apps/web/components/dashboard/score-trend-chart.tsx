"use client";

// recharts (~100kb, browser-only) lives in this leaf so the dashboard card can
// next/dynamic({ ssr: false }) it and keep recharts out of the initial dashboard
// bundle. react-doctor still flags the static recharts import below — by-design
// false positive: the rule is a static-import heuristic and can't see this file
// is only reached via the dynamic boundary. Same shape as exam-result-charts.
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/components/chart";

const chartConfig = {
  percentage: { label: "Score", color: "var(--primary)" },
} satisfies ChartConfig;

export function ScoreTrendChart({
  data,
}: {
  data: { label: string; percentage: number }[];
}) {
  return (
    <ChartContainer config={chartConfig} className="mt-6 h-40 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.12} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
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
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#scoreFill)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
