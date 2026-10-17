import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { RoutePending } from "@/components/route-pending";
import { Button } from "@repo/ui/components/button";
import {
  getRecentSeries,
  getTodayLabel,
  getUserDashboardStats,
} from "@/lib/actions/dashboard.action";
import { ScoreTrendCard } from "@/components/dashboard/score-trend-card";
import { DashboardReveal, RevealItem } from "@/components/dashboard/reveal";
import { LinkPending } from "@/components/link-pending";

// press feedback + color hover on a single row. Matches the app's Button press
// (a subtle 1px nudge, not a big scale). Only transform/bg animate (GPU).
const rowClass =
  "flex items-center justify-between gap-3 rounded-xl border border-border p-4 " +
  "transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] " +
  "hover:bg-muted/50 active:translate-y-px";

export default function DashboardPage() {
  return (
    <DashboardReveal>
      {/* per-user block — streams behind Suspense so the shell paints first */}
      <Suspense fallback={<RoutePending />}>
        <Overview />
      </Suspense>

      {/* series (shared cache → static shell) + recent attempts (streamed rows) */}
      <div className="mt-3 grid gap-2 lg:grid-cols-3">
        <RevealItem index={5} className="lg:col-span-1">
          <SeriesCard />
        </RevealItem>
        <RevealItem index={6} className="lg:col-span-2">
          <Card className="h-full p-6">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-heading text-xl">Recent attempts</h2>
              <Button
                size="sm"
                variant="ghost"
                className="-mr-2 text-muted-foreground"
                render={<Link href="/all-test-series" />}
              >
                View all
                {/*<ArrowRight className="size-4" />*/}
                <LinkPending />
              </Button>
            </div>
            <Suspense fallback={<RoutePending />}>
              <RecentRows />
            </Suspense>
          </Card>
        </RevealItem>
      </div>

      {/* date pill — cached label, part of the static shell */}
      <DatePill />
    </DashboardReveal>
  );
}

async function Overview() {
  const stats = await getUserDashboardStats();

  return (
    <>
      <RevealItem index={0}>
        <header>
          <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">
            Hello,{" "}
            <span className="text-muted-foreground italic">
              {stats.userName.split(" ")[0]}.
            </span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {stats.availableCount} mock test
              {stats.availableCount === 1 ? "" : "s"}
            </span>{" "}
            ready to attempt.{" "}
            {stats.thisWeekCount > 0
              ? `${stats.thisWeekCount} done this week — keep the momentum.`
              : "Start one to get on the board."}
          </p>
        </header>
      </RevealItem>

      <div className="my-6 h-px bg-border" />

      <div className="grid gap-2 lg:grid-cols-3">
        <RevealItem index={1} className="lg:col-span-2">
          <ScoreTrendCard
            attempts={stats.attempts}
            lastAttempt={stats.lastAttempt}
          />
        </RevealItem>
        <div className="grid grid-rows-3 gap-2">
          <RevealItem index={2}>
            <StatCard label="This week" value={String(stats.thisWeekCount)}>
              <span className="text-sm text-muted-foreground">
                tests attempted
              </span>
            </StatCard>
          </RevealItem>
          <RevealItem index={3}>
            <StatCard
              label="Average score"
              value={stats.totalTests ? `${Math.round(stats.avgScore)}%` : "—"}
            >
              {stats.avgScoreDelta != null ? (
                <span
                  className={
                    stats.avgScoreDelta >= 0
                      ? "text-sm font-medium text-emerald-600"
                      : "text-sm font-medium text-red-600"
                  }
                >
                  {stats.avgScoreDelta >= 0 ? "↗ +" : "↘ −"}
                  {Math.abs(Math.round(stats.avgScoreDelta * 10) / 10)} this
                  month
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  across {stats.totalTests} mock
                  {stats.totalTests === 1 ? "" : "s"}
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
    </>
  );
}

async function SeriesCard() {
  const series = await getRecentSeries();

  return (
    <Card className="h-full p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-heading text-xl">Test series</h2>
        <Button
          size="sm"
          variant="ghost"
          className="-mr-2 text-muted-foreground"
          render={<Link href="/all-test-series" />}
        >
          View all
          {/*<ArrowRight className="size-4" />*/}
          <LinkPending />
        </Button>
      </div>
      <div className="mt-4 space-y-2.5">
        {series.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No test series published yet.
          </p>
        ) : (
          series.map((s) => (
            <Link
              key={s.seriesName}
              href={`/all-test-series/${encodeURIComponent(s.seriesName)}`}
              className={rowClass}
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{s.seriesName}</p>
                <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                  {s.subjectLabel}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm tabular-nums text-muted-foreground">
                  {s.testCount} test{s.testCount === 1 ? "" : "s"}
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}

async function RecentRows() {
  const stats = await getUserDashboardStats();
  const attempts = stats.attempts.slice(0, 4);

  if (attempts.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">No attempts yet.</p>
    );
  }

  return (
    <div className="mt-4 space-y-2.5">
      {attempts.map((a) => (
        <Link
          key={a.id}
          href={`/exams/${a.examId}/result`}
          className={rowClass}
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{a.examName}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
              {a.subject} · {a.totalQuestions} Qs · {a.durationMinutes}m
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="font-heading text-xl tabular-nums">
              {Math.round(a.percentage)}%
            </span>
            <ArrowRight className="size-4 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  );
}

async function DatePill() {
  const label = await getTodayLabel();

  return (
    <div className="fixed right-6 top-6 z-30 flex w-fit items-center gap-1.5 rounded-full border bg-card/80 px-3.5 py-1.5 text-xs text-muted-foreground shadow-secondary backdrop-blur">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      {label}
    </div>
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
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="font-heading text-2xl font-medium tracking-tight tabular-nums">
        {value}
      </p>
      <div>{children}</div>
    </Card>
  );
}
