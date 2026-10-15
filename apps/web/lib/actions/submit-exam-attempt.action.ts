"use server";

import { updateTag } from "next/cache";
import { prisma, type Prisma } from "@repo/db";
import { getCurrentUser } from "@/lib/utils/current-user";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import {
  submitExamAttemptSchema,
  type SubmitExamAttemptInput,
} from "../validations/submit-exam-attempt.validation";

// never select Option.is_correct out of this action's response — it's only
// read here, server-side, to compute correctness. Client sends
// {questionId, selectedOptionId}[] and nothing else is trusted.
const scoringQuestionSelect = {
  id: true,
  subsection: {
    select: {
      id: true,
      name: true,
      order: true,
      marks_per_question: true,
      negative_marking_ratio: true,
    },
  },
  options: { select: { id: true, is_correct: true } },
} satisfies Prisma.QuestionSelect;

export type SectionBreakdownItem = {
  section_id: string | null;
  section_name: string;
  total_questions: number;
  correct: number;
  incorrect: number;
  skipped: number;
  score: number;
  total_marks: number;
  cutoff: number;
  cleared: boolean;
};

export type SubmitExamAttemptResult = {
  raw_score: number;
  final_score: number;
  percentage: number;
  correct_answers: number;
  incorrect_answers: number;
  skipped_questions: number;
  section_breakdown: SectionBreakdownItem[];
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

type SectionAccumulator = {
  section_name: string;
  order: number;
  total_questions: number;
  correct: number;
  incorrect: number;
  skipped: number;
  score: number;
  total_marks: number;
};

// single write for the whole attempt — computed here, never trusted from the
// client, and written into the same ExamAttempt row locked at start
export async function submitExamAttempt(
  input: SubmitExamAttemptInput,
): Promise<SubmitExamAttemptResult> {
  const parsed = submitExamAttemptSchema.parse(input);
  const user = await getCurrentUser();
  await enforceRateLimit({ name: "submit-exam-attempt", limit: 5, windowSeconds: 60, identity: user.id });

  const attempt = await prisma.examAttempt.findUnique({
    where: { user_id_exam_id: { user_id: user.id, exam_id: parsed.exam_id } },
    select: { completed_at: true },
  });
  if (!attempt) throw new Error("no attempt in progress for this exam");
  if (attempt.completed_at) throw new Error("attempt already submitted");

  const exam = await prisma.exam.findUniqueOrThrow({
    where: { id: parsed.exam_id },
    select: {
      negative_marking: true,
      pass_score_percent: true,
      questions: { select: scoringQuestionSelect },
    },
  });
  const examNegativeRatio = exam.negative_marking.toNumber();
  const passPercent = exam.pass_score_percent.toNumber();

  const answerMap = new Map(parsed.answers.map((a) => [a.question_id, a.selected_option_id]));
  const sections = new Map<string, SectionAccumulator>();

  let rawScore = 0;
  let penalty = 0;
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;

  for (const question of exam.questions) {
    const subsection = question.subsection;
    const marksPerQuestion = subsection?.marks_per_question?.toNumber() ?? 1;
    const negativeRatio = subsection?.negative_marking_ratio?.toNumber() ?? examNegativeRatio;

    const sectionKey = subsection?.id ?? "ungrouped";
    let section = sections.get(sectionKey);
    if (!section) {
      section = {
        section_name: subsection?.name ?? "General",
        order: subsection?.order ?? Number.MAX_SAFE_INTEGER,
        total_questions: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        score: 0,
        total_marks: 0,
      };
      sections.set(sectionKey, section);
    }
    section.total_questions++;
    section.total_marks += marksPerQuestion;

    const selectedOptionId = answerMap.get(question.id);
    if (!selectedOptionId) {
      skipped++;
      section.skipped++;
      continue;
    }

    const isCorrect = question.options.some(
      (o) => o.id === selectedOptionId && o.is_correct,
    );
    if (isCorrect) {
      correct++;
      section.correct++;
      rawScore += marksPerQuestion;
      section.score += marksPerQuestion;
    } else {
      incorrect++;
      section.incorrect++;
      const questionPenalty = marksPerQuestion * negativeRatio;
      penalty += questionPenalty;
      section.score -= questionPenalty;
    }
  }

  const finalScore = rawScore - penalty;
  const totalPossible = [...sections.values()].reduce((sum, s) => sum + s.total_marks, 0);
  const percentage = totalPossible > 0 ? (finalScore / totalPossible) * 100 : 0;

  const sectionBreakdown: SectionBreakdownItem[] = [...sections.entries()]
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([sectionKey, s]) => {
      const score = round2(s.score);
      const cutoff = round2((s.total_marks * passPercent) / 100);
      return {
        section_id: sectionKey === "ungrouped" ? null : sectionKey,
        section_name: s.section_name,
        total_questions: s.total_questions,
        correct: s.correct,
        incorrect: s.incorrect,
        skipped: s.skipped,
        score,
        total_marks: round2(s.total_marks),
        cutoff,
        cleared: score >= cutoff,
      };
    });

  const result: SubmitExamAttemptResult = {
    raw_score: round2(rawScore),
    final_score: round2(finalScore),
    percentage: round2(percentage),
    correct_answers: correct,
    incorrect_answers: incorrect,
    skipped_questions: skipped,
    section_breakdown: sectionBreakdown,
  };

  await prisma.examAttempt.update({
    where: { user_id_exam_id: { user_id: user.id, exam_id: parsed.exam_id } },
    data: { ...result, completed_at: new Date() },
  });

  // new attempt changes the graph, stats and recent-attempts — updateTag forces
  // an immediate refresh (read-your-writes) so the dashboard is fresh next load.
  updateTag(`dashboard:${user.id}`);

  return result;
}
