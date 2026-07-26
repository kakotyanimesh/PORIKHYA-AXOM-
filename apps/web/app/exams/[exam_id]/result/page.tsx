import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { getCurrentUser } from "@/lib/utils/current-user";
import type { SectionBreakdownItem } from "@/lib/actions/submit-exam-attempt.action";
import { ExamResultView, type ExamResultData } from "@/components/exam-result/exam-result-view";

// auth + per-user attempt reads are dynamic; keep them inside Suspense so the
// route isn't a blocking prerender under Cache Components (PPR)
export default function ExamResultPage({
  params,
}: {
  params: Promise<{ exam_id: string }>;
}) {
  return (
    <Suspense>
      <ExamResultContent params={params} />
    </Suspense>
  );
}

async function ExamResultContent({
  params,
}: {
  params: Promise<{ exam_id: string }>;
}) {
  const { exam_id } = await params;
  const user = await getCurrentUser();

  const [attempt, exam] = await Promise.all([
    prisma.examAttempt.findUnique({
      where: { user_id_exam_id: { user_id: user.id, exam_id } },
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
    }),
    prisma.exam.findUnique({
      where: { id: exam_id },
      select: { name: true, duration_minutes: true, negative_marking: true },
    }),
  ]);

  if (
    !attempt ||
    !attempt.completed_at ||
    !exam ||
    attempt.final_score === null ||
    attempt.correct_answers === null ||
    attempt.incorrect_answers === null ||
    attempt.skipped_questions === null ||
    attempt.percentage === null
  ) {
    notFound();
  }

  const sections = (attempt.section_breakdown as SectionBreakdownItem[] | null) ?? [];
  const totalMarks = sections.reduce((sum, s) => sum + s.total_marks, 0);
  const cutoff = sections.reduce((sum, s) => sum + s.cutoff, 0);
  const timeTakenMinutes =
    (attempt.completed_at.getTime() - attempt.started_at.getTime()) / 60000;

  const data: ExamResultData = {
    examName: exam.name,
    submittedAt: attempt.completed_at.toLocaleString(),
    finalScore: attempt.final_score.toNumber(),
    totalMarks,
    cutoff,
    correctAnswers: attempt.correct_answers,
    incorrectAnswers: attempt.incorrect_answers,
    skippedQuestions: attempt.skipped_questions,
    percentage: attempt.percentage.toNumber(),
    timeTakenMinutes,
    durationMinutes: exam.duration_minutes,
    markingLabel: `+1 correct · −${exam.negative_marking.toNumber()} wrong`,
    sections,
  };

  return <ExamResultView data={data} />;
}
