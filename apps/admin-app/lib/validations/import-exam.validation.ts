import { z } from "zod";
import { EXAM_CATEGORIES } from "./exam.validation";

// Raw JSON shape produced by guide/prompt-pdf-to-mock-json.md. Loose here —
// the strict per-question rules (>=2 options, exactly one correct) are enforced
// by the SHARED questionSchema when each row is mapped, so the manual editor and
// this importer can't diverge.

export const rawOptionSchema = z.object({
  text: z.string().trim().min(1),
  text_assamese: z.string().trim().optional().nullable(),
  position: z.string().optional(),
  is_correct: z.boolean().default(false),
});

export const rawQuestionSchema = z.object({
  question_number: z.coerce.number().int().optional(),
  section: z.string().trim().optional().nullable(),
  content: z.string().trim().min(1, "content is required"),
  content_assamese: z.string().trim().optional().nullable(),
  solution_text: z.string().trim().optional().nullable(),
  solution_text_assamese: z.string().trim().optional().nullable(),
  options: z.array(rawOptionSchema),
});

export const importExamSchema = z.object({
  exam: z.object({
    name: z.string().trim().min(1, "exam.name is required"),
    subject: z.string().trim().min(1, "exam.subject is required"),
    category: z.enum(EXAM_CATEGORIES, {
      message: `exam.category must be one of ${EXAM_CATEGORIES.join(", ")}`,
    }),
    series_name: z.string().trim().min(1, "exam.series_name is required"),
    duration_minutes: z.coerce.number().int().positive(),
    negative_marking: z.coerce.number().min(0),
    pass_score_percent: z.coerce.number().min(0).max(100),
  }),
  questions: z.array(rawQuestionSchema).min(1, "questions array is empty"),
});
export type ImportExamInput = z.infer<typeof importExamSchema>;
