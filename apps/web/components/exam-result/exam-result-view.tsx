"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ShareIcon,
  DownloadIcon,
  // ArrowRightIcon,
  ArrowLeftIcon,
  CircleCheckIcon,
  TargetIcon,
  CircleXIcon,
  ClockIcon,
  AwardIcon,
  CircleMinusIcon,
  type LucideIcon,
} from "lucide-react";
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
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Logo } from "@repo/ui/components/logo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/components/chart";
import { cn } from "@repo/ui/lib/utils";
import type { SectionBreakdownItem } from "@/lib/actions/submit-exam-attempt.action";

const CLEARED_COLOR = "oklch(0.72 0.19 149)";
const MISSED_COLOR = "var(--destructive)";

export type ExamResultData = {
  examName: string;
  submittedAt: string;
  finalScore: number;
  totalMarks: number;
  cutoff: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  percentage: number;
  timeTakenMinutes: number;
  durationMinutes: number;
  markingLabel: string;
  sections: SectionBreakdownItem[];
};

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function ExamResultView({ data }: { data: ExamResultData }) {
  const attempted = data.correctAnswers + data.incorrectAnswers;
  const totalQuestions = attempted + data.skippedQuestions;
  const accuracy = attempted > 0 ? (data.correctAnswers / attempted) * 100 : 0;
  const cleared = data.finalScore >= data.cutoff;
  const gap = Math.round(Math.abs(data.finalScore - data.cutoff) * 100) / 100;

  const ringValue = Math.max(0, Math.min(data.finalScore, data.totalMarks));
  const ringConfig = {
    score: { label: "Score", color: cleared ? CLEARED_COLOR : MISSED_COLOR },
  } satisfies ChartConfig;

  const fillPercent =
    data.totalMarks > 0 ? (ringValue / data.totalMarks) * 100 : 0;
  const cutoffPercent =
    data.totalMarks > 0 ? (data.cutoff / data.totalMarks) * 100 : 0;

  const barConfig = {
    cleared: { label: "Your score (cleared)", color: CLEARED_COLOR },
    missed: { label: "Your score (missed)", color: MISSED_COLOR },
    cutoff: { label: "Cutoff", color: "var(--foreground)" },
  } satisfies ChartConfig;

  const barData = data.sections.map((s) => ({
    section: s.section_name,
    cleared: s.cleared ? s.score : null,
    missed: s.cleared ? null : s.score,
    cutoff: s.cutoff,
  }));

  const rootRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // rasterize the result DOM to PNG. html-to-image (not html2canvas) because
  // the page is full of oklch() colors — foreignObject serialization defers to
  // the browser's own renderer, so oklch/webfonts survive. Lazy-imported so the
  // lib only loads when the button is actually clicked.
  async function handleDownload() {
    const node = rootRef.current;
    if (!node || downloading) return;
    setDownloading(true);

    // temporarily reveal the export-only brand footer and un-clip the table's
    // horizontal scroll container, so the capture includes the full width and
    // the logo. Restore all of it afterwards, whatever happens.
    const restore: Array<() => void> = [];
    node.querySelectorAll<HTMLElement>("[data-export-only]").forEach((el) => {
      const prev = el.style.display;
      el.style.display = "flex";
      restore.push(() => (el.style.display = prev));
    });
    node
      .querySelectorAll<HTMLElement>('[data-slot="table-container"]')
      .forEach((el) => {
        const prev = el.style.overflow;
        el.style.overflow = "visible";
        restore.push(() => (el.style.overflow = prev));
      });

    try {
      const { toPng } = await import("html-to-image");
      const background = getComputedStyle(document.documentElement)
        .getPropertyValue("--background")
        .trim();
      // size to scrollWidth/Height, not the default offsetWidth — the stat grid
      // and un-clipped table overflow the max-w container, and offsetWidth would
      // crop them (the "half image" bug)
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: background || undefined,
        width: node.scrollWidth,
        height: node.scrollHeight,
        style: { margin: "0" },
        // skip the action bar (Back/Share/Download) so the image is just the report
        filter: (el) =>
          !(el instanceof HTMLElement && el.dataset.exportIgnore === "true"),
      });
      const link = document.createElement("a");
      link.download = `${data.examName.replace(/\s+/g, "-").toLowerCase()}-result.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error("Couldn't generate the image. Please try again.");
    } finally {
      restore.forEach((fn) => fn());
      setDownloading(false);
    }
  }

  return (
    <div ref={rootRef} className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div
        data-export-ignore="true"
        className="flex items-center justify-between gap-2"
      >
        <Button
          variant="outline"
          size="lg"
          render={<Link href="/all-test-series" />}
        >
          <ArrowLeftIcon /> Back to test series
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ShareIcon /> Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
          >
            <DownloadIcon /> {downloading ? "Preparing…" : "Download"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Result
        </span>
        <p className="text-md text-foreground font-semibold">
          {data.examName} · submitted {data.submittedAt}
        </p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-2 lg:grid-cols-[minmax(0,440px)_1fr]">
        <Card className="flex flex-col justify-between gap-6 p-6 shadow-none">
          <div className="flex items-center gap-5">
            <div className="relative size-36 shrink-0">
              <ChartContainer
                config={ringConfig}
                className="aspect-square h-full w-full"
              >
                <RadialBarChart
                  data={[
                    {
                      name: "score",
                      value: ringValue,
                      fill: "var(--color-score)",
                    },
                  ]}
                  innerRadius={58}
                  outerRadius={72}
                  startAngle={90}
                  endAngle={-270}
                  barSize={12}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, data.totalMarks]}
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
                <span className="text-2xl font-semibold tabular-nums">
                  {data.finalScore}
                </span>
                <span className="text-xs text-muted-foreground">
                  of {data.totalMarks}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Gap
              </span>
              <span className="font-heading text-2xl">
                {cleared ? "Cleared by " : "Missed by "}
                <span style={{ color: cleared ? CLEARED_COLOR : MISSED_COLOR }}>
                  {gap}
                </span>
              </span>
              <span className="text-sm text-muted-foreground">
                Cutoff {data.cutoff} · Score {data.finalScore}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="relative h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${fillPercent}%`,
                  backgroundColor: cleared ? CLEARED_COLOR : MISSED_COLOR,
                }}
              />
              <div
                className="absolute top-0 h-full w-0.5 bg-foreground"
                style={{ left: `${cutoffPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>Cutoff {data.cutoff}</span>
              <span>{data.totalMarks}</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
          <Stat
            icon={CircleCheckIcon}
            label="Correct"
            value={data.correctAnswers}
            tint="green"
          />
          <Stat
            icon={TargetIcon}
            label="Accuracy"
            value={`${accuracy.toFixed(1)}%`}
            sub={`${attempted}/${totalQuestions} attempted`}
          />
          <Stat
            icon={CircleXIcon}
            label="Wrong"
            value={data.incorrectAnswers}
            tint="red"
          />
          <Stat
            icon={ClockIcon}
            label="Time taken"
            value={formatDuration(data.timeTakenMinutes)}
            sub={`of ${formatDuration(data.durationMinutes)}`}
          />
          <Stat
            icon={AwardIcon}
            label="Attempted"
            value={attempted}
            tint="blue"
          />
          <Stat
            icon={CircleMinusIcon}
            label="Skipped"
            value={data.skippedQuestions}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-3">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Breakdown
            </span>
            <h2 className="font-heading text-2xl">Section by section.</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {data.markingLabel}
          </span>
        </div>
        <Card className="overflow-x-auto p-0 shadow-none">
          <Table className="">
            <TableHeader className="bg-secondary p-2">
              <TableRow className="hover:bg-transparent">
                <TableHead>Section</TableHead>
                <TableHead>Qns</TableHead>
                <TableHead>Correct</TableHead>
                <TableHead>Wrong</TableHead>
                <TableHead>Skipped</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Cutoff</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.sections.map((s, i) => (
                <TableRow key={s.section_id ?? "ungrouped"}>
                  <TableCell>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium">{s.section_name}</span>
                    </span>
                  </TableCell>
                  <TableCell>{s.total_questions}</TableCell>
                  <TableCell className="text-emerald-600">
                    {s.correct}
                  </TableCell>
                  <TableCell className="text-destructive">
                    {s.incorrect}
                  </TableCell>
                  <TableCell>{s.skipped}</TableCell>
                  <TableCell className="font-medium">{s.score}</TableCell>
                  <TableCell>{s.cutoff}</TableCell>
                  <TableCell>
                    <Badge variant={s.cleared ? "default" : "destructive"}>
                      {s.cleared ? "Cleared" : "Missed"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="mt-2 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Chart
          </span>
          <h2 className="font-heading text-2xl">Your score vs cutoff.</h2>
        </div>
        <Card className="p-6">
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
                <LabelList
                  position="top"
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
              <Bar dataKey="missed" fill="var(--color-missed)" radius={4}>
                <LabelList
                  position="top"
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
              <Bar dataKey="cutoff" fill="var(--color-cutoff)" radius={4} />
            </BarChart>
          </ChartContainer>
        </Card>
      </div>

      {/* brand footer — hidden on screen, revealed only in the downloaded image
          (data-export-only is toggled to display:flex during capture) */}
      <div
        data-export-only
        className="mt-2 hidden items-center justify-between gap-3 border-t border-border pt-6"
      >
        <Logo />
        <span className="text-sm text-muted-foreground">
          Free mock tests for Assam competitive exams
        </span>
      </div>
    </div>
  );
}

const TINT_CLASS = {
  green: "bg-emerald-50 dark:bg-emerald-950/30",
  red: "bg-red-50 dark:bg-red-950/30",
  blue: "bg-blue-50 dark:bg-blue-950/30",
} as const;

const ICON_CLASS = {
  green: "text-emerald-600",
  red: "text-destructive",
  blue: "text-blue-600",
} as const;

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  tint?: keyof typeof TINT_CLASS;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between gap-2 shadow-none border border-muted-foreground/10 p-4",
        tint && TINT_CLASS[tint],
      )}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <Icon className={cn("size-3.5", tint && ICON_CLASS[tint])} />
        {label}
      </div>
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            "text-2xl font-semibold tabular-nums",
            tint === "red" && "text-destructive",
          )}
        >
          {value}
        </span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </Card>
  );
}
