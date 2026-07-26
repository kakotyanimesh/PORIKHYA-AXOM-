"use server";

import { prisma, type Prisma } from "@repo/db";
import { getCurrentUser } from "@/lib/utils/current-user";
import {
  submitExamAttemptSchema,
  type SubmitExamAttemptInput,
} from "../validations/submit-exam-attempt.validation";

// never select Option.is_correct out of this action's response — it's only
// read here, server-side, to compute correctness. Client sends
// {questionId, selectedOptionId}[] and nothing else is trusted.
const scoringQuestionSelect = {
  id: true,
  subsection: { select: { marks_per_question: true, negative_marking_ratio: true } },
  options: { select: { id: true, is_correct: true } },
} satisfies Prisma.QuestionSelect;

export type SubmitExamAttemptResult = {
  raw_score: number;
  final_score: number;
  percentage: number;
  correct_answers: number;
  incorrect_answers: number;
  skipped_questions: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// single write for the whole attempt — computed here, never trusted from the
// client, and written into the same ExamAttempt row locked at start
export async function submitExamAttempt(
  input: SubmitExamAttemptInput,
): Promise<SubmitExamAttemptResult> {
  const parsed = submitExamAttemptSchema.parse(input);
  const user = await getCurrentUser();

  const attempt = await prisma.examAttempt.findUnique({
    where: { user_id_exam_id: { user_id: user.id, exam_id: parsed.exam_id } },
    select: { completed_at: true },
  });
  if (!attempt) throw new Error("no attempt in progress for this exam");
  if (attempt.completed_at) throw new Error("attempt already submitted");

  const exam = await prisma.exam.findUniqueOrThrow({
    where: { id: parsed.exam_id },
    select: { negative_marking: true, questions: { select: scoringQuestionSelect } },
  });
  const examNegativeRatio = exam.negative_marking.toNumber();

  const answerMap = new Map(parsed.answers.map((a) => [a.question_id, a.selected_option_id]));

  let rawScore = 0;
  let penalty = 0;
  let totalPossible = 0;
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;

  for (const question of exam.questions) {
    const marksPerQuestion = question.subsection?.marks_per_question?.toNumber() ?? 1;
    const negativeRatio =
      question.subsection?.negative_marking_ratio?.toNumber() ?? examNegativeRatio;
    totalPossible += marksPerQuestion;

    const selectedOptionId = answerMap.get(question.id);
    if (!selectedOptionId) {
      skipped++;
      continue;
    }

    const isCorrect = question.options.some(
      (o) => o.id === selectedOptionId && o.is_correct,
    );
    if (isCorrect) {
      correct++;
      rawScore += marksPerQuestion;
    } else {
      incorrect++;
      penalty += marksPerQuestion * negativeRatio;
    }
  }

  const finalScore = rawScore - penalty;
  const percentage = totalPossible > 0 ? (finalScore / totalPossible) * 100 : 0;

  const result: SubmitExamAttemptResult = {
    raw_score: round2(rawScore),
    final_score: round2(finalScore),
    percentage: round2(percentage),
    correct_answers: correct,
    incorrect_answers: incorrect,
    skipped_questions: skipped,
  };

  await prisma.examAttempt.update({
    where: { user_id_exam_id: { user_id: user.id, exam_id: parsed.exam_id } },
    data: { ...result, completed_at: new Date() },
  });

  return result;
}
