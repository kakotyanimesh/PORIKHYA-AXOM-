"use server";

import { cacheLife, cacheTag } from "next/cache";
import { prisma, type Prisma } from "@repo/db";
import {
  getExamInstructionsSchema,
  type GetExamInstructionsInput,
} from "../validations/exam-instructions.validation";

const examInstructionsSelect = {
  id: true,
  series_name: true,
  name: true,
  duration_minutes: true,
  total_questions: true,
  negative_marking: true,
} satisfies Prisma.ExamSelect;

export type ExamInstructions = Omit<
  Prisma.ExamGetPayload<{ select: typeof examInstructionsSelect }>,
  "negative_marking"
> & { negative_marking: number };

async function fetchExamInstructions(examId: string): Promise<ExamInstructions | null> {
  "use cache";
  cacheTag(`exam:${examId}`);
  cacheLife("hours");

  const exam = await prisma.exam.findFirst({
    // is_pyq_public exams are public answer keys, not attemptable — exclude so the
    // detail/attempt pages 404 for them instead of offering a Start gate (F1 guard).
    where: { id: examId, is_active: true, is_pyq_public: false },
    select: examInstructionsSelect,
  });
  if (!exam) return null;

  // Prisma.Decimal isn't plain-serializable across the "use cache" boundary
  return { ...exam, negative_marking: exam.negative_marking.toNumber() };
}

export async function getExamInstructions(
  input: GetExamInstructionsInput,
): Promise<ExamInstructions | null> {
  const parsed = getExamInstructionsSchema.parse(input);
  return fetchExamInstructions(parsed.exam_id);
}
