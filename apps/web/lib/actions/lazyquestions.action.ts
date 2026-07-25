"use server";

import { cacheLife, cacheTag } from "next/cache";
import { prisma, type Prisma } from "@repo/db";
import {
  getExamAttemptInitSchema,
  getSectionQuestionsSchema,
  type GetExamAttemptInitInput,
  type GetSectionQuestionsInput,
} from "../validations/lazyquestions.validation";

// attempt-time payload only — never Option.is_correct, never solution_text*
// (those are answer-review fields, out of scope until scoring exists)
const attemptQuestionSelect = {
  id: true,
  content: true,
  content_assamese: true,
  order: true,
  options: {
    select: { id: true, text: true, text_assamese: true, order: true },
    orderBy: { order: "asc" },
  },
} satisfies Prisma.QuestionSelect;

export type AttemptQuestion = Prisma.QuestionGetPayload<{ select: typeof attemptQuestionSelect }>;

export type ExamSection = {
  id: string | null; // null = questions with no subsection
  name: string | null;
  order: number;
  question_count: number;
};

export type ExamAttemptInit = {
  exam_id: string;
  sections: ExamSection[];
  first_section_id: string | null;
  first_section_questions: AttemptQuestion[];
};

async function fetchSectionQuestions(
  examId: string,
  sectionId: string | null,
): Promise<AttemptQuestion[]> {
  "use cache";
  cacheTag(`exam-questions:${examId}:${sectionId ?? "ungrouped"}`);
  cacheLife("hours");

  return prisma.question.findMany({
    where: { exam_id: examId, subsection_id: sectionId },
    select: attemptQuestionSelect,
    orderBy: { order: "asc" },
  });
}

async function fetchExamSections(examId: string): Promise<ExamSection[]> {
  "use cache";
  cacheTag(`exam-sections:${examId}`);
  cacheLife("hours");

  const [subsections, ungroupedCount] = await Promise.all([
    prisma.subsection.findMany({
      where: { exam_id: examId },
      select: { id: true, name: true, order: true, _count: { select: { questions: true } } },
      orderBy: { order: "asc" },
    }),
    prisma.question.count({ where: { exam_id: examId, subsection_id: null } }),
  ]);

  const sections: ExamSection[] = subsections.map((s) => ({
    id: s.id,
    name: s.name,
    order: s.order,
    question_count: s._count.questions,
  }));

  // fallback group for exams (or stray questions) with no subsection —
  // always sorts last so the client's fallback cache key stays predictable
  if (ungroupedCount > 0) {
    sections.push({ id: null, name: null, order: sections.length, question_count: ungroupedCount });
  }

  return sections;
}

// one section's worth of questions — never the whole exam in one call
export async function getSectionQuestions(
  input: GetSectionQuestionsInput,
): Promise<AttemptQuestion[]> {
  const parsed = getSectionQuestionsSchema.parse(input);
  return fetchSectionQuestions(parsed.exam_id, parsed.section_id);
}

// exam-start call: structure for every section (id, order, count) plus the
// first section's questions inline, so the client skips a round-trip for it
export async function getExamAttemptInit(
  input: GetExamAttemptInitInput,
): Promise<ExamAttemptInit> {
  const parsed = getExamAttemptInitSchema.parse(input);
  const sections = await fetchExamSections(parsed.exam_id);
  const firstSection = sections[0] ?? null;
  const firstSectionQuestions = firstSection
    ? await fetchSectionQuestions(parsed.exam_id, firstSection.id)
    : [];

  return {
    exam_id: parsed.exam_id,
    sections,
    first_section_id: firstSection?.id ?? null,
    first_section_questions: firstSectionQuestions,
  };
}
