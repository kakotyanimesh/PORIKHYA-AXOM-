import Link from "next/link";
import { Play } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { getCurrentUser } from "@/lib/utils/current-user";
import { getDashboardData } from "@/lib/actions/dashboard.action";
import { ScoreTrendCard } from "@/components/dashboard/score-trend-card";

const weekday = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  day: "numeric",
  month: "short",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const data = await getDashboardData(user.id, user.name);

  return (
    <div className="space-y-6">
      {/* greeting */}
      <header>
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {weekday.format(new Date())}
        </p>
        <h1 className="mt-3 font-heading text-5xl font-medium tracking-tight">
          Hello, {data.userName.split(" ")[0]}.
        </h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          <span className="font-medium text-foreground">
            {data.available.length} mock test{data.available.length === 1 ? "" : "s"}
          </span>{" "}
          ready to attempt.{" "}
          {data.thisWeekCount > 0
            ? `${data.thisWeekCount} done this week — keep the momentum.`
            : "Start one to get on the board."}
        </p>
      </header>

      {/* trend + stat cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScoreTrendCard attempts={data.attempts} lastAttempt={data.lastAttempt} />
        </div>
        <div className="flex flex-col gap-4">
          <StatCard label="This week" value={String(data.thisWeekCount)}>
            <span className="text-sm text-muted-foreground">tests attempted</span>
          </StatCard>
          <StatCard
            label="Average score"
            value={data.totalTests ? `${Math.round(data.avgScore)}%` : "—"}
          >
            {data.avgScoreDelta != null ? (
              <span
                className={
                  data.avgScoreDelta >= 0
                    ? "text-sm font-medium text-emerald-600"
                    : "text-sm font-medium text-red-600"
                }
              >
                {data.avgScoreDelta >= 0 ? "↗ +" : "↘ −"}
                {Math.abs(Math.round(data.avgScoreDelta * 10) / 10)} this month
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                across {data.totalTests} mock{data.totalTests === 1 ? "" : "s"}
              </span>
            )}
          </StatCard>
          <StatCard label="Total tests completed" value={String(data.totalTests)}>
            <span className="text-sm text-muted-foreground">all time</span>
          </StatCard>
        </div>
      </div>

      {/* continue + recent attempts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Continue
          </p>
          <h2 className="mt-1 font-heading text-2xl font-medium">Available tests</h2>
          <div className="mt-5 space-y-3">
            {data.available.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You&apos;ve attempted every available test. Nice.
              </p>
            ) : (
              data.available.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/exams/${exam.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{exam.name}</p>
                    <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                      {exam.totalQuestions} Qs · {exam.durationMinutes}m
                    </p>
                  </div>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Play className="size-4 fill-current" />
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Recent attempts
          </p>
          <h2 className="mt-1 font-heading text-2xl font-medium">
            Where you&apos;ve been
          </h2>
          {data.attempts.length === 0 ? (
            <p className="mt-5 text-sm text-muted-foreground">No attempts yet.</p>
          ) : (
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Qs</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.attempts.slice(0, 8).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.examName}</TableCell>
                    <TableCell className="text-muted-foreground">{a.subject}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {a.totalQuestions}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {a.durationMinutes}m
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {Math.round(a.percentage)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
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
    <Card className="flex-1 p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 font-heading text-4xl font-medium tabular-nums">{value}</p>
      <div className="mt-2">{children}</div>
    </Card>
  );
}
