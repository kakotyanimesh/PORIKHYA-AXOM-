"use server";

import { updateTag } from "next/cache";
import { prisma } from "@repo/db";
import { requireAdmin } from "@/lib/utils/require-admin";
import {
  subsectionSchema,
  updateSubsectionSchema,
  type SubsectionInput,
  type UpdateSubsectionInput,
} from "../validations/subsection.validation";

export type SubsectionActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

function invalidate(examId: string) {
  updateTag(`exam-sections:${examId}`);
  updateTag(`exam:${examId}`);
}

function toData(input: Omit<SubsectionInput, "exam_id">) {
  return {
    name: input.name,
    marks_per_question: input.marks_per_question ?? null,
    negative_marking_ratio: input.negative_marking_ratio ?? null,
    order: input.order,
  };
}

export async function createSubsection(
  input: SubsectionInput,
): Promise<SubsectionActionResult> {
  await requireAdmin();
  const parsed = subsectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { exam_id, ...rest } = parsed.data;
  const sub = await prisma.subsection.create({
    data: { exam_id, ...toData(rest) },
  });
  invalidate(exam_id);
  return { success: true, id: sub.id };
}

export async function updateSubsection(
  input: UpdateSubsectionInput,
): Promise<SubsectionActionResult> {
  await requireAdmin();
  const parsed = updateSubsectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { id, exam_id, ...rest } = parsed.data;
  const sub = await prisma.subsection.update({
    where: { id },
    data: toData(rest),
  });
  invalidate(exam_id);
  return { success: true, id: sub.id };
}

export async function deleteSubsection(
  id: string,
): Promise<SubsectionActionResult> {
  await requireAdmin();
  if (!id) return { success: false, error: "id is required" };
  try {
    const sub = await prisma.subsection.delete({ where: { id } });
    invalidate(sub.exam_id);
    return { success: true, id };
  } catch {
    // Question.subsection_id is SetNull, so questions survive (revert to
    // exam-level) — this only fires on a genuine failure (e.g. not found).
    return { success: false, error: "Failed to delete subsection." };
  }
}
