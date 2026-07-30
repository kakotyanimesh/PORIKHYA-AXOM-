"use server";

import { cacheLife, cacheTag } from "next/cache";
import { prisma, type Prisma } from "@repo/db";

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
  examName: string;
  subject: string;
  totalQuestions: number;
  durationMinutes: number;
  completedAt: Date;
  percentage: number;
};

export type DashboardAvailableExam = {
  id: string;
  name: string;
  subject: string;
  series_name: string;
  is_free: boolean;
  totalQuestions: number;
  durationMinutes: number;
};

export type DashboardData = {
  userName: string;
  totalTests: number;
  avgScore: number; // percentage, 0 when no attempts
  avgScoreDelta: number | null; // this-month avg minus last-month avg, null if either empty
  thisWeekCount: number;
  lastAttempt: { name: string; percentage: number; delta: number | null } | null;
  attempts: DashboardAttempt[]; // newest first
  available: DashboardAvailableExam[]; // not-yet-attempted active exams
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
    examName: r.exam.name,
    subject: r.exam.subject,
    totalQuestions: r.exam.total_questions,
    durationMinutes: r.exam.duration_minutes,
    completedAt: r.completed_at as Date,
    percentage: r.percentage ? Number(r.percentage) : 0,
  };
}

export async function getDashboardData(
  userId: string,
  userName: string,
): Promise<DashboardData> {
  "use cache: private";
  cacheLife("minutes");
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
  const availableRows = await prisma.exam.findMany({
    where: { is_active: true, id: { notIn: attemptedExamIds } },
    select: {
      id: true,
      name: true,
      subject: true,
      series_name: true,
      is_free: true,
      total_questions: true,
      duration_minutes: true,
    },
    orderBy: [{ series_name: "asc" }, { name: "asc" }],
    take: 6,
  });
  const available: DashboardAvailableExam[] = availableRows.map((e) => ({
    id: e.id,
    name: e.name,
    subject: e.subject,
    series_name: e.series_name,
    is_free: e.is_free,
    totalQuestions: e.total_questions,
    durationMinutes: e.duration_minutes,
  }));

  return {
    userName,
    totalTests,
    avgScore,
    avgScoreDelta,
    thisWeekCount,
    lastAttempt,
    attempts,
    available,
  };
}
