"use server";

import { prisma } from "@repo/db";
import { getCurrentUser } from "@/lib/utils/current-user";
import type { SectionBreakdownItem } from "@/lib/actions/submit-exam-attempt.action";
import type { ExamResultData } from "@/components/exam-result/exam-result-view";

export async function getExamResultData(examId: string): Promise<ExamResultData | null> {
  if (!examId || typeof examId !== "string" || examId.length > 100) {
    throw new Error("Invalid exam ID");
  }

  const [user, exam] = await Promise.all([
    getCurrentUser(),
    prisma.exam.findUnique({
      where: { id: examId },
      select: { name: true, duration_minutes: true, negative_marking: true },
    }),
  ]);
  if (!exam) return null;

  const attempt = await prisma.examAttempt.findUnique({
    where: { user_id_exam_id: { user_id: user.id, exam_id: examId } },
    select: {
      started_at: true,
      completed_at: true,
      final_score: true,
      correct_answers: true,
      incorrect_answers: true,
      skipped_questions: true,
      percentage: true,
      section_breakdown: true,
    },
  });

  if (
    !attempt ||
    !attempt.completed_at ||
    attempt.final_score === null ||
    attempt.correct_answers === null ||
    attempt.incorrect_answers === null ||
    attempt.skipped_questions === null ||
    attempt.percentage === null
  ) return null;

  const sections = (attempt.section_breakdown as SectionBreakdownItem[] | null) ?? [];
  const totalMarks = sections.reduce((sum, section) => sum + section.total_marks, 0);
  const cutoff = sections.reduce((sum, section) => sum + section.cutoff, 0);
  return {
    examName: exam.name,
    submittedAt: attempt.completed_at.toLocaleString(),
    finalScore: attempt.final_score.toNumber(),
    totalMarks,
    cutoff,
    correctAnswers: attempt.correct_answers,
    incorrectAnswers: attempt.incorrect_answers,
    skippedQuestions: attempt.skipped_questions,
    percentage: attempt.percentage.toNumber(),
    timeTakenMinutes:
      (attempt.completed_at.getTime() - attempt.started_at.getTime()) / 60000,
    durationMinutes: exam.duration_minutes,
    markingLabel: `+1 correct · −${exam.negative_marking.toNumber()} wrong`,
    sections,
  };
}
