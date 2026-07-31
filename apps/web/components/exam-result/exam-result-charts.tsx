"use client";

// recharts is heavy (~100kb) and browser-only. Both charts live here so the
// parent can `next/dynamic({ ssr: false })` them and keep recharts out of the
// initial result-page bundle.
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/components/chart";
import type { SectionBreakdownItem } from "@/lib/actions/submit-exam-attempt.action";
import { CLEARED_COLOR, MISSED_COLOR } from "./result-colors";

const barConfig = {
  cleared: { label: "Your score (cleared)", color: CLEARED_COLOR },
  missed: { label: "Your score (missed)", color: MISSED_COLOR },
  cutoff: { label: "Cutoff", color: "var(--foreground)" },
} satisfies ChartConfig;

export function ScoreRingChart({
  finalScore,
  totalMarks,
  cleared,
}: {
  finalScore: number;
  totalMarks: number;
  cleared: boolean;
}) {
  const ringValue = Math.max(0, Math.min(finalScore, totalMarks));
  const ringConfig = {
    score: { label: "Score", color: cleared ? CLEARED_COLOR : MISSED_COLOR },
  } satisfies ChartConfig;

  return (
    <div className="relative size-36 shrink-0">
      <ChartContainer config={ringConfig} className="aspect-square h-full w-full">
        <RadialBarChart
          data={[{ name: "score", value: ringValue, fill: "var(--color-score)" }]}
          innerRadius={58}
          outerRadius={72}
          startAngle={90}
          endAngle={-270}
          barSize={12}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, totalMarks]}
            tick={false}
            axisLine={false}
          />
          <RadialBar
            dataKey="value"
            background={{ fill: "var(--muted)" }}
            cornerRadius={8}
          />
        </RadialBarChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums">{finalScore}</span>
        <span className="text-xs text-muted-foreground">of {totalMarks}</span>
      </div>
    </div>
  );
}

export function SectionBarChart({
  sections,
}: {
  sections: SectionBreakdownItem[];
}) {
  const barData = sections.map((s) => ({
    section: s.section_name,
    cleared: s.cleared ? s.score : null,
    missed: s.cleared ? null : s.score,
    cutoff: s.cutoff,
  }));

  return (
    <ChartContainer config={barConfig} className="max-h-80 w-full">
      <BarChart data={barData} margin={{ top: 24 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="section"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis tickLine={false} axisLine={false} width={28} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="cleared" fill="var(--color-cleared)" radius={4}>
          <LabelList position="top" className="fill-foreground" fontSize={12} />
        </Bar>
        <Bar dataKey="missed" fill="var(--color-missed)" radius={4}>
          <LabelList position="top" className="fill-foreground" fontSize={12} />
        </Bar>
        <Bar dataKey="cutoff" fill="var(--color-cutoff)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
