import { z } from "zod";

export const getExamAttemptInitSchema = z.object({
  exam_id: z.string().min(1, "exam_id is required"),
});

export type GetExamAttemptInitInput = z.infer<typeof getExamAttemptInitSchema>;

export const getSectionQuestionsSchema = z.object({
  exam_id: z.string().min(1, "exam_id is required"),
  section_id: z.string().min(1).nullable(),
});

export type GetSectionQuestionsInput = z.infer<typeof getSectionQuestionsSchema>;
