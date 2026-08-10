"use server";

import { cacheLife, cacheTag } from "next/cache";
import { prisma, type Prisma } from "@repo/db";
import { getCurrentUser } from "@/lib/utils/current-user";

// completed attempts only — dashboard is about finished tests. Decimal columns
// serialized to number at the boundary so client components (chart) get plain
// JSON. Dates serialize fine over the RSC boundary.
const attemptSelect = {
  id: true,
  completed_at: true,
  percentage: true,
  final_score: true,
  correct_answers: true,
  incorrect_answers: true,
  skipped_questions: true,
  exam: {
    select: {
      id: true,
      name: true,
      subject: true,
      total_questions: true,
      duration_minutes: true,
    },
  },
} satisfies Prisma.ExamAttemptSelect;

type AttemptRow = Prisma.ExamAttemptGetPayload<{ select: typeof attemptSelect }>;

export type DashboardAttempt = {
  id: string;
  examId: string;
  examName: string;
  subject: string;
  totalQuestions: number;
  durationMinutes: number;
  completedAt: Date;
  percentage: number;
};

export type DashboardSeries = {
  seriesName: string;
  subjectLabel: string;
  testCount: number;
};

// per-user stats block — everything that changes when the user submits an exam
export type UserDashboardStats = {
  userName: string;
  totalTests: number;
  avgScore: number; // percentage, 0 when no attempts
  avgScoreDelta: number | null; // this-month avg minus last-month avg, null if either empty
  thisWeekCount: number;
  lastAttempt: { name: string; percentage: number; delta: number | null } | null;
  attempts: DashboardAttempt[]; // newest first
  availableCount: number; // active exams not yet attempted (header copy)
};

function startOfWeek(now: Date): Date {
  // Monday-based, server-local. ponytail: no per-user tz, derive from client if
  // it ever matters.
  const d = new Date(now);
  const day = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

function avg(nums: number[]): number {
  return nums.length === 0 ? 0 : nums.reduce((s, n) => s + n, 0) / nums.length;
}

function toAttempt(r: AttemptRow): DashboardAttempt {
  return {
    id: r.id,
    examId: r.exam.id,
    examName: r.exam.name,
    subject: r.exam.subject,
    totalQuestions: r.exam.total_questions,
    durationMinutes: r.exam.duration_minutes,
    completedAt: r.completed_at as Date,
    percentage: r.percentage ? Number(r.percentage) : 0,
  };
}

// Identity comes from the session, never from caller-supplied arguments — this is
// an exported action, so userId/userName params would be a trivial IDOR (read
// anyone's attempt history). getCurrentUser's redirect stays outside the
// "use cache" boundary by living in this wrapper, not the cached fetch below.
export async function getUserDashboardStats(): Promise<UserDashboardStats> {
  const user = await getCurrentUser();
  return fetchUserDashboardStats(user.id, user.name);
}

// Per-user, private cache. Held indefinitely and invalidated explicitly when
// the user submits an exam (revalidateTag(`dashboard:${userId}`) in
// submit-exam-attempt.action) — that's what refreshes the graph/stats/recent.
async function fetchUserDashboardStats(
  userId: string,
  userName: string,
): Promise<UserDashboardStats> {
  "use cache: private";
  cacheLife("days");
  cacheTag(`dashboard:${userId}`);

  const rows = await prisma.examAttempt.findMany({
    where: { user_id: userId, completed_at: { not: null } },
    select: attemptSelect,
    orderBy: { completed_at: "desc" },
  });

  const attempts = rows.map(toAttempt);
  const totalTests = attempts.length;
  const avgScore = avg(attempts.map((a) => a.percentage));

  const now = new Date();
  const weekStart = startOfWeek(now);
  const thisWeekCount = attempts.filter((a) => a.completedAt >= weekStart).length;

  // month-over-month average delta
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = attempts.filter((a) => a.completedAt >= thisMonthStart);
  const lastMonth = attempts.filter(
    (a) => a.completedAt >= lastMonthStart && a.completedAt < thisMonthStart,
  );
  const avgScoreDelta =
    thisMonth.length && lastMonth.length
      ? avg(thisMonth.map((a) => a.percentage)) - avg(lastMonth.map((a) => a.percentage))
      : null;

  // last attempt trend vs the one before it (attempts are newest-first)
  const lastAttempt = attempts[0]
    ? {
        name: attempts[0].examName,
        percentage: attempts[0].percentage,
        delta: attempts[1] ? attempts[0].percentage - attempts[1].percentage : null,
      }
    : null;

  const attemptedExamIds = rows.map((r) => r.exam.id);
  const availableCount = await prisma.exam.count({
    where: { is_active: true, id: { notIn: attemptedExamIds } },
  });

  return {
    userName,
    totalTests,
    avgScore,
    avgScoreDelta,
    thisWeekCount,
    lastAttempt,
    attempts,
    availableCount,
  };
}

// Shared (not per-user) catalogue data. Same tag as the all-test-series page,
// so publishing/editing exams invalidates both. Long-lived — this lands in the
// dashboard's static shell, which is why the card paints instantly.
export async function getRecentSeries(): Promise<DashboardSeries[]> {
  "use cache";
  cacheTag("exam-series:all");
  cacheLife({ stale: 300, revalidate: 60 * 60 * 15, expire: 60 * 60 * 24 });

  // series = Exam.series_name grouped, never a table. newest-first, so the first
  // row per series is its latest exam and insertion order gives recent series
  // first. Take 3.
  const seriesRows = await prisma.exam.findMany({
    where: { is_active: true },
    select: { series_name: true, subject: true },
    orderBy: { created_at: "desc" },
  });
  const seen = new Map<string, DashboardSeries>();
  for (const r of seriesRows) {
    const g = seen.get(r.series_name);
    if (g) g.testCount += 1;
    else
      seen.set(r.series_name, {
        seriesName: r.series_name,
        subjectLabel: r.subject,
        testCount: 1,
      });
  }
  return Array.from(seen.values()).slice(0, 3);
}

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  day: "numeric",
  month: "short",
});

// `new Date()` in the page render would block the static shell. Baking it into
// a cache boundary keeps the date pill part of the prerendered shell; refreshes
// hourly, fine for a weekday label.
export async function getTodayLabel(): Promise<string> {
  "use cache";
  cacheLife("hours");
  return weekdayFormatter.format(new Date());
}
