"use server";

import { cacheLife, cacheTag } from "next/cache";
import { prisma, type Prisma } from "@repo/db";
import {
  getTestSeriesBySeriesNameSchema,
  type GetTestSeriesBySeriesNameInput,
} from "../validations/test-series.validation";

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
    where: { is_active: true },
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
    where: { is_active: true },
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
    where: { is_active: true, series_name: seriesName },
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

// `new Date()` outside a cache scope blocks the static shell; baking it in
// here means the label refreshes on the same cadence as the exam data.
export async function getIndexedDateLabel(): Promise<string> {
  "use cache";
  cacheLife("hours");

  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" })
    .format(new Date())
    .toUpperCase();
}
