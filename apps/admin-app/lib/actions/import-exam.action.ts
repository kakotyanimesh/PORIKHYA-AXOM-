"use server";

import { updateTag } from "next/cache";
import { prisma } from "@repo/db";
import { requireAdmin } from "@/lib/utils/require-admin";
import {
  importExamSchema,
  type ImportExamInput,
} from "../validations/import-exam.validation";
import { questionSchema, type QuestionInput } from "../validations/question.validation";
import { writeQuestion } from "@/lib/utils/write-question";

export type QuestionIssue = { index: number; label: string; error: string };

export type ImportReport =
  | {
      ok: true;
      examName: string;
      seriesName: string;
      category: string;
      questionCount: number;
      sections: string[]; // distinct subsection names, first-appearance order
    }
  | { ok: false; errors: string[]; questionIssues: QuestionIssue[] };

export type ImportCommitResult =
  | { success: true; examId: string; questionCount: number }
  | { success: false; error: string };

// Normalized, ready-to-write structure. Each question already passed the
// SHARED questionSchema (>=2 options, exactly one correct).
type Normalized = {
  exam: ImportExamInput["exam"];
  sections: string[];
  questions: { sectionName: string | null; input: QuestionInput }[];
};

function parseJson(text: string): { data?: unknown; error?: string } {
  try {
    return { data: JSON.parse(text) };
  } catch (e) {
    return { error: `Invalid JSON: ${(e as Error).message}` };
  }
}

// Single validation path used by BOTH the dry-run report and the commit, so a
// preview that says "clean" can't disagree with what commit accepts.
function validate(text: string): Normalized | ImportReport {
  const parsed = parseJson(text);
  if (parsed.error) return { ok: false, errors: [parsed.error], questionIssues: [] };

  const top = importExamSchema.safeParse(parsed.data);
  if (!top.success) {
    return {
      ok: false,
      errors: top.error.issues.map((i) => `${i.path.join(".") || "root"}: ${i.message}`),
      questionIssues: [],
    };
  }

  const sections: string[] = [];
  const questions: Normalized["questions"] = [];
  const questionIssues: QuestionIssue[] = [];

  top.data.questions.forEach((raw, idx) => {
    const sectionName = raw.section?.trim() || null;
    if (sectionName && !sections.includes(sectionName)) sections.push(sectionName);

    // map raw -> shared QuestionInput candidate, then validate with the SAME
    // schema the manual editor uses.
    const candidate = {
      content: raw.content,
      content_assamese: raw.content_assamese ?? undefined,
      solution_text: raw.solution_text ?? undefined,
      solution_text_assamese: raw.solution_text_assamese ?? undefined,
      order: raw.question_number ?? idx,
      options: raw.options.map((o) => ({
        text: o.text,
        text_assamese: o.text_assamese ?? undefined,
        is_correct: o.is_correct,
      })),
    };
    const q = questionSchema.safeParse(candidate);
    const label = `Q${raw.question_number ?? idx + 1}`;
    if (!q.success) {
      questionIssues.push({
        index: idx,
        label,
        error: q.error.issues[0]?.message ?? "invalid",
      });
      return;
    }
    questions.push({ sectionName, input: q.data });
  });

  if (questionIssues.length > 0) {
    return { ok: false, errors: [], questionIssues };
  }

  return { exam: top.data.exam, sections, questions };
}

function isReport(v: Normalized | ImportReport): v is ImportReport {
  return "ok" in v;
}

export async function reportImport(jsonText: string): Promise<ImportReport> {
  await requireAdmin();
  const result = validate(jsonText);
  if (isReport(result)) return result;
  return {
    ok: true,
    examName: result.exam.name,
    seriesName: result.exam.series_name,
    category: result.exam.category,
    questionCount: result.questions.length,
    sections: result.sections,
  };
}

export async function commitImport(jsonText: string): Promise<ImportCommitResult> {
  await requireAdmin();
  const result = validate(jsonText);
  if (isReport(result)) {
    const first =
      result.ok === false
        ? (result.errors[0] ?? result.questionIssues[0]?.error ?? "Validation failed")
        : "Validation failed";
    return { success: false, error: first };
  }
  const { exam, sections, questions } = result;

  // Idempotent, non-destructive: refuse if this exam already exists.
  const existing = await prisma.exam.findFirst({
    where: { name: exam.name, series_name: exam.series_name },
    select: { id: true },
  });
  if (existing) {
    return {
      success: false,
      error: `Exam "${exam.name}" already exists in series "${exam.series_name}". Rename or delete it first.`,
    };
  }

  const examId = await prisma.$transaction(async (tx) => {
    const created = await tx.exam.create({
      data: {
        name: exam.name,
        subject: exam.subject,
        category: exam.category,
        series_name: exam.series_name,
        duration_minutes: exam.duration_minutes,
        negative_marking: exam.negative_marking,
        pass_score_percent: exam.pass_score_percent,
        total_questions: questions.length,
        subsections: {
          create: sections.map((name, i) => ({ name, order: i })),
        },
      },
      select: {
        id: true,
        subsections: { select: { id: true, name: true } },
      },
    });

    const sectionIdByName = new Map(created.subsections.map((s) => [s.name, s.id]));

    for (const q of questions) {
      const subsectionId = q.sectionName ? sectionIdByName.get(q.sectionName) ?? null : null;
      await writeQuestion(tx, created.id, { ...q.input, subsection_id: subsectionId });
    }
    return created.id;
  });

  updateTag("exam-series:all");
  updateTag(`exam-series:${exam.series_name}`);
  updateTag(`exam:${examId}`);
  updateTag("exam-categories");
  return { success: true, examId, questionCount: questions.length };
}
