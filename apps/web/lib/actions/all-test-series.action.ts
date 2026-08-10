"use server";

import { cacheLife, cacheTag } from "next/cache";
import { prisma, type Prisma } from "@repo/db";
import {
  getTestSeriesBySeriesNameSchema,
  type GetTestSeriesBySeriesNameInput,
} from "../validations/test-series.validation";

// built once at module load — rebuilding an Intl formatter per call is slow
const indexedDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

const testSeriesExamSelect = {
  id: true,
  series_name: true,
  name: true,
  subject: true,
  category: true,
  is_free: true,
  image_url: true,
} satisfies Prisma.ExamSelect;

export type TestSeriesExam = Prisma.ExamGetPayload<{ select: typeof testSeriesExamSelect }>;

export async function getAllTestSeries(): Promise<TestSeriesExam[]> {
  "use cache";
  cacheTag("exam-series:all");
  cacheLife("hours");

  return prisma.exam.findMany({
    // is_pyq_public exams are public answer keys, not sellable/attemptable mocks —
    // excluded from every attemptable surface so an exam is never both (F1 guard).
    where: { is_active: true, is_pyq_public: false },
    select: testSeriesExamSelect,
    orderBy: [{ series_name: "asc" }, { name: "asc" }],
  });
}

// distinct series names — used by generateStaticParams to prerender one static
// page per series so navigation (incl. back/forward) is instant, not a re-fetch.
export async function getAllSeriesNames(): Promise<string[]> {
  "use cache";
  cacheTag("exam-series:all");
  cacheLife("hours");

  const rows = await prisma.exam.findMany({
    // is_pyq_public exams are public answer keys, not sellable/attemptable mocks —
    // excluded from every attemptable surface so an exam is never both (F1 guard).
    where: { is_active: true, is_pyq_public: false },
    distinct: ["series_name"],
    select: { series_name: true },
    orderBy: { series_name: "asc" },
  });
  return rows.map((r) => r.series_name);
}

// mock tests (Exam rows) belonging to one series, e.g. every "TET" test.
const mockTestSelect = {
  id: true,
  name: true,
  subject: true,
  category: true,
  duration_minutes: true,
  total_questions: true,
  is_free: true,
  year: true,
} satisfies Prisma.ExamSelect;

export type MockTest = Prisma.ExamGetPayload<{ select: typeof mockTestSelect }>;

async function fetchMockTestsBySeriesName(seriesName: string): Promise<MockTest[]> {
  "use cache";
  cacheTag(`exam-series:${seriesName}`);
  cacheLife("hours");

  return prisma.exam.findMany({
    where: { is_active: true, is_pyq_public: false, series_name: seriesName },
    select: mockTestSelect,
    orderBy: { name: "asc" },
  });
}

export async function getMockTestsBySeriesName(
  input: GetTestSeriesBySeriesNameInput,
): Promise<MockTest[]> {
  const parsed = getTestSeriesBySeriesNameSchema.parse(input);
  return fetchMockTestsBySeriesName(parsed.series_name);
}

// plans that unlock exactly this series' category (the ₹249/₹499 packs). The
// all-category super plan (multiple category_grants) is deliberately excluded —
// it lives on its own upgrade page. Series → category is derived from the exams.
export type SeriesPackPlan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
};

export async function getSeriesPackPlans(
  seriesName: string,
): Promise<{ category: string; seriesName: string; plans: SeriesPackPlan[] } | null> {
  "use cache";
  cacheTag(`exam-series:${seriesName}`);
  cacheTag("plans:all");
  cacheLife("hours");

  const exam = await prisma.exam.findFirst({
    where: { is_active: true, is_pyq_public: false, series_name: seriesName },
    select: { category: true },
  });
  if (!exam) return null;

  const plans = await prisma.plan.findMany({
    where: { is_active: true, category_grants: { equals: [exam.category] } },
    orderBy: { price: "asc" },
    select: { id: true, name: true, price: true, duration_days: true },
  });

  return {
    category: exam.category,
    seriesName,
    plans: plans.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      durationDays: p.duration_days,
    })),
  };
}

// `new Date()` outside a cache scope blocks the static shell; baking it in
// here means the label refreshes on the same cadence as the exam data.
export async function getIndexedDateLabel(): Promise<string> {
  "use cache";
  cacheLife("hours");

  return indexedDateFormatter.format(new Date()).toUpperCase();
}
