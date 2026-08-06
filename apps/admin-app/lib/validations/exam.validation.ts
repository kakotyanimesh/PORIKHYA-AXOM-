import { z } from "zod";

// Prisma enum ExamCategory — keep in sync with schema.prisma.
export const EXAM_CATEGORIES = [
  "ASSAM_TET",
  "ASSAM_POLICE",
  "APSC",
  "ADRE",
  "OTHER",
] as const;

export const examSchema = z.object({
  series_name: z.string().trim().min(1, "Series name is required"),
  name: z.string().trim().min(1, "Exam name is required"),
  subject: z.string().trim().min(1, "Subject is required"),
  category: z.enum(EXAM_CATEGORIES),
  duration_minutes: z.coerce.number().int().positive("Duration must be > 0"),
  // total_questions is author-set (mirrors the seed script). It can drift from
  // the real Question count until Phase D wires a live count.
  // ponytail: manual field, derive from questions.count when the editor lands.
  total_questions: z.coerce.number().int().min(0),
  negative_marking: z.coerce.number().min(0, "Cannot be negative"),
  pass_score_percent: z.coerce.number().min(0).max(100),
  is_free: z.boolean().default(false),
  is_pyq_public: z.boolean().default(false),
  is_active: z.boolean().default(true),
  image_url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .optional(),
  // form sends undefined when the year box is empty.
  year: z.coerce.number().int().min(1900).max(2200).optional(),
});
export type ExamInput = z.infer<typeof examSchema>;

export const updateExamSchema = examSchema.extend({
  id: z.string().min(1),
});
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
