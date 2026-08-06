"use server";

import { updateTag } from "next/cache";
import { prisma, type Prisma } from "@repo/db";
import { requireAdmin } from "@/lib/utils/require-admin";
import { z } from "zod";
import {
  createQuestionSchema,
  updateQuestionSchema,
  questionSchema,
  type QuestionInput,
} from "../validations/question.validation";

export type QuestionActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

function invalidate(examId: string, subsectionId?: string | null) {
  updateTag(`exam-sections:${examId}`);
  updateTag(`exam:${examId}`);
  updateTag(`exam-questions:${examId}:${subsectionId ?? "ungrouped"}`);
}

/**
 * Shared create helper — the SINGLE place a Question + its Options get written.
 * Used by the manual editor here AND the Phase F bulk import, so the two author
 * paths can never drift. Runs inside a transaction. `subsectionId` null =
 * exam-level. Caller must pass already-validated input.
 */
export async function writeQuestion(
  tx: Prisma.TransactionClient,
  examId: string,
  input: QuestionInput,
): Promise<string> {
  const question = await tx.question.create({
    data: {
      exam_id: examId,
      subsection_id: input.subsection_id ?? null,
      content: input.content,
      content_assamese: input.content_assamese || null,
      solution_text: input.solution_text || null,
      solution_text_assamese: input.solution_text_assamese || null,
      order: input.order,
      options: {
        create: input.options.map((o, i) => ({
          text: o.text,
          text_assamese: o.text_assamese || null,
          is_correct: o.is_correct,
          order: i,
        })),
      },
    },
  });
  return question.id;
}

export async function createQuestion(
  input: unknown,
): Promise<QuestionActionResult> {
  await requireAdmin();
  const parsed = createQuestionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { exam_id, ...question } = parsed.data;

  // Cap at the exam's planned total_questions (0 = uncapped). Guards against a
  // stale client count letting more through than the exam allows.
  const exam = await prisma.exam.findUnique({
    where: { id: exam_id },
    select: { total_questions: true },
  });
  if (!exam) return { success: false, error: "Exam not found" };
  if (exam.total_questions > 0) {
    const current = await prisma.question.count({ where: { exam_id } });
    if (current >= exam.total_questions) {
      return {
        success: false,
        error: `This exam is full (${exam.total_questions} questions). Raise "Total questions" on the exam to add more.`,
      };
    }
  }

  const id = await prisma.$transaction((tx) => writeQuestion(tx, exam_id, question));
  invalidate(exam_id, question.subsection_id);
  return { success: true, id };
}

const batchSchema = z.object({
  exam_id: z.string().min(1),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

// Manual-entry batch: the admin stages many questions in the browser and this
// writes them ALL in a single transaction (one round-trip, not one per save).
// Reuses writeQuestion so the shape matches the manual/JSON paths exactly.
export async function createQuestionsBatch(
  input: unknown,
): Promise<{ success: true; count: number } | { success: false; error: string }> {
  await requireAdmin();
  const parsed = batchSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { exam_id, questions } = parsed.data;

  const exam = await prisma.exam.findUnique({
    where: { id: exam_id },
    select: { total_questions: true },
  });
  if (!exam) return { success: false, error: "Exam not found" };
  if (exam.total_questions > 0) {
    const current = await prisma.question.count({ where: { exam_id } });
    if (current + questions.length > exam.total_questions) {
      const room = Math.max(exam.total_questions - current, 0);
      return {
        success: false,
        error: `Only room for ${room} more (limit ${exam.total_questions}). Remove some or raise the exam's Total questions.`,
      };
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const q of questions) await writeQuestion(tx, exam_id, q);
  });

  const subsectionIds = new Set(questions.map((q) => q.subsection_id ?? null));
  updateTag(`exam:${exam_id}`);
  updateTag(`exam-sections:${exam_id}`);
  for (const sid of subsectionIds) {
    updateTag(`exam-questions:${exam_id}:${sid ?? "ungrouped"}`);
  }
  return { success: true, count: questions.length };
}

export async function updateQuestion(
  input: unknown,
): Promise<QuestionActionResult> {
  await requireAdmin();
  const parsed = updateQuestionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { id, exam_id, ...question } = parsed.data;
  // replace options wholesale — simpler than diffing, options have no FK deps.
  await prisma.$transaction(async (tx) => {
    await tx.option.deleteMany({ where: { question_id: id } });
    await tx.question.update({
      where: { id },
      data: {
        subsection_id: question.subsection_id ?? null,
        content: question.content,
        content_assamese: question.content_assamese || null,
        solution_text: question.solution_text || null,
        solution_text_assamese: question.solution_text_assamese || null,
        order: question.order,
        options: {
          create: question.options.map((o, i) => ({
            text: o.text,
            text_assamese: o.text_assamese || null,
            is_correct: o.is_correct,
            order: i,
          })),
        },
      },
    });
  });
  invalidate(exam_id, question.subsection_id);
  return { success: true, id };
}

export async function deleteQuestion(
  id: string,
  examId: string,
): Promise<QuestionActionResult> {
  await requireAdmin();
  if (!id) return { success: false, error: "id is required" };
  // Options cascade on question delete (schema onDelete: Cascade).
  await prisma.question.delete({ where: { id } });
  invalidate(examId);
  return { success: true, id };
}
