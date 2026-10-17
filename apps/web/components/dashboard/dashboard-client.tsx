"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  getDashboardPageData,
  type DashboardPageData,
  type DashboardSeries,
} from "@/lib/actions/dashboard.action";
import { ScoreTrendCard } from "@/components/dashboard/score-trend-card";
import { DashboardReveal, RevealItem } from "@/components/dashboard/reveal";
import {
  OverviewSkeleton,
  RowsSkeleton,
} from "@/components/dashboard/skeletons";
import { LinkPending } from "@/components/link-pending";
import {
  getDashboardDataCacheRevision,
  loadDashboardData,
  readDashboardDataCache,
  subscribeDashboardDataCache,
} from "@/components/dashboard/dashboard-data-cache";

const rowClass =
  "flex items-center justify-between gap-3 rounded-xl border border-border p-4 " +
  "transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] " +
  "hover:bg-muted/50 active:translate-y-px";

export function DashboardClient() {
  const cachedData = readDashboardDataCache();
  const cacheRevision = useSyncExternalStore(
    subscribeDashboardDataCache,
    getDashboardDataCacheRevision,
    () => 0,
  );

  useEffect(() => {
    if (readDashboardDataCache()) return;
    loadDashboardData(getDashboardPageData)
      .then(() => undefined)
      .catch(() => undefined);
  }, [cacheRevision, cachedData]);

  return (
    <DashboardReveal>
      {cachedData ? (
        <DashboardContent data={cachedData} />
      ) : (
        <DashboardSkeleton />
      )}
    </DashboardReveal>
  );
}

function DashboardContent({ data }: { data: DashboardPageData }) {
  const { stats, series, todayLabel } = data;
  const attempts = stats.attempts.slice(0, 4);

  return (
    <>
      <RevealItem index={0}>
        <header>
          <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">
            Hello, <span className="text-muted-foreground italic">{stats.userName.split(" ")[0]}.</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {stats.availableCount} mock test{stats.availableCount === 1 ? "" : "s"}
            </span>{" "}
            ready to attempt. {stats.thisWeekCount > 0
              ? `${stats.thisWeekCount} done this week — keep the momentum.`
              : "Start one to get on the board."}
          </p>
        </header>
      </RevealItem>

      <div className="my-6 h-px bg-border" />

      <div className="grid gap-2 lg:grid-cols-3">
        <RevealItem index={1} className="lg:col-span-2">
          <ScoreTrendCard attempts={stats.attempts} lastAttempt={stats.lastAttempt} />
        </RevealItem>
        <div className="grid grid-rows-3 gap-2">
          <RevealItem index={2}>
            <StatCard label="This week" value={String(stats.thisWeekCount)}>
              <span className="text-sm text-muted-foreground">tests attempted</span>
            </StatCard>
          </RevealItem>
          <RevealItem index={3}>
            <StatCard label="Average score" value={stats.totalTests ? `${Math.round(stats.avgScore)}%` : "—"}>
              {stats.avgScoreDelta != null ? (
                <span className={stats.avgScoreDelta >= 0
                  ? "text-sm font-medium text-emerald-600"
                  : "text-sm font-medium text-red-600"}>
                  {stats.avgScoreDelta >= 0 ? "↗ +" : "↘ −"}
                  {Math.abs(Math.round(stats.avgScoreDelta * 10) / 10)} this month
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  across {stats.totalTests} mock{stats.totalTests === 1 ? "" : "s"}
                </span>
              )}
            </StatCard>
          </RevealItem>
          <RevealItem index={4}>
            <StatCard label="Total completed" value={String(stats.totalTests)}>
              <span className="text-sm text-muted-foreground">all time</span>
            </StatCard>
          </RevealItem>
        </div>
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-3">
        <RevealItem index={5} className="lg:col-span-1">
          <SeriesCard series={series} />
        </RevealItem>
        <RevealItem index={6} className="lg:col-span-2">
          <Card className="h-full p-6">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-heading text-xl">Recent attempts</h2>
              <Button size="sm" variant="ghost" className="-mr-2 text-muted-foreground" render={<Link href="/all-test-series" />}>
                View all <LinkPending />
              </Button>
            </div>
            {attempts.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No attempts yet.</p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {attempts.map((attempt) => (
                  <Link key={attempt.id} href={`/exams/${attempt.examId}/result`} className={rowClass}>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{attempt.examName}</p>
                      <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                        {attempt.subject} · {attempt.totalQuestions} Qs · {attempt.durationMinutes}m
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-heading text-xl tabular-nums">{Math.round(attempt.percentage)}%</span>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </RevealItem>
      </div>

      <div className="fixed right-6 top-6 z-30 flex w-fit items-center gap-1.5 rounded-full border bg-card/80 px-3.5 py-1.5 text-xs text-muted-foreground shadow-secondary backdrop-blur">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        {todayLabel}
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <OverviewSkeleton />
      <div className="mt-3 grid gap-2 lg:grid-cols-3">
        <Card className="p-6">
          <Skeleton className="h-6 w-28" />
          <RowsSkeleton rows={3} />
        </Card>
        <Card className="p-6 lg:col-span-2">
          <Skeleton className="h-6 w-36" />
          <RowsSkeleton rows={4} />
        </Card>
      </div>
    </>
  );
}

function SeriesCard({ series }: { series: DashboardSeries[] }) {
  return (
    <Card className="h-full p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-heading text-xl">Test series</h2>
        <Button size="sm" variant="ghost" className="-mr-2 text-muted-foreground" render={<Link href="/all-test-series" />}>
          View all <LinkPending />
        </Button>
      </div>
      <div className="mt-4 space-y-2.5">
        {series.length === 0 ? (
          <p className="text-sm text-muted-foreground">No test series published yet.</p>
        ) : series.map((item) => (
          <Link key={item.seriesName} href={`/all-test-series/${encodeURIComponent(item.seriesName)}`} className={rowClass}>
            <div className="min-w-0">
              <p className="truncate font-medium">{item.seriesName}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">{item.subjectLabel}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm tabular-nums text-muted-foreground">
                {item.testCount} test{item.testCount === 1 ? "" : "s"}
              </span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function StatCard({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full justify-center gap-1 px-5 py-3">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-heading text-2xl font-medium tracking-tight tabular-nums">{value}</p>
      <div>{children}</div>
    </Card>
  );
}
