"use server";

import { updateTag } from "next/cache";
import { prisma } from "@repo/db";
import { requireAdmin } from "@/lib/utils/require-admin";
import {
  examSchema,
  updateExamSchema,
  type ExamInput,
  type UpdateExamInput,
} from "../validations/exam.validation";

export type ExamActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

function invalidate(seriesName: string, examId?: string) {
  updateTag("exam-series:all");
  updateTag(`exam-series:${seriesName}`);
  updateTag("exam-categories");
  updateTag("pyq:all");
  if (examId) updateTag(`exam:${examId}`);
}

// map validated input to the Prisma data shape (empty strings -> null).
function toData(input: ExamInput) {
  return {
    series_name: input.series_name,
    name: input.name,
    subject: input.subject,
    category: input.category,
    duration_minutes: input.duration_minutes,
    total_questions: input.total_questions,
    negative_marking: input.negative_marking,
    pass_score_percent: input.pass_score_percent,
    is_free: input.is_free,
    is_pyq_public: input.is_pyq_public,
    is_active: input.is_active,
    image_url: input.image_url ? input.image_url : null,
    year: input.year ?? null,
  };
}

export async function createExam(input: ExamInput): Promise<ExamActionResult> {
  await requireAdmin();
  const parsed = examSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const exam = await prisma.exam.create({ data: toData(parsed.data) });
  invalidate(exam.series_name, exam.id);
  return { success: true, id: exam.id };
}

export async function updateExam(input: UpdateExamInput): Promise<ExamActionResult> {
  await requireAdmin();
  const parsed = updateExamSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { id, ...rest } = parsed.data;
  const previous = await prisma.exam.findUnique({
    where: { id },
    select: { series_name: true },
  });
  const exam = await prisma.exam.update({ where: { id }, data: toData(rest) });
  invalidate(exam.series_name, exam.id);
  if (previous && previous.series_name !== exam.series_name) {
    invalidate(previous.series_name, exam.id);
  }
  return { success: true, id: exam.id };
}

export async function deleteExam(id: string): Promise<ExamActionResult> {
  await requireAdmin();
  if (!id) return { success: false, error: "id is required" };
  try {
    const exam = await prisma.exam.delete({ where: { id } });
    invalidate(exam.series_name, exam.id);
    return { success: true, id };
  } catch {
    // FK restrict: exam has attempts/questions/purchases.
    return {
      success: false,
      error: "Cannot delete — exam has questions, attempts, or purchases. Set it inactive instead.",
    };
  }
}
