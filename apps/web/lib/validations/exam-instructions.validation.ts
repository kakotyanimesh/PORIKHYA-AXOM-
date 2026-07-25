import { z } from "zod";

export const getExamInstructionsSchema = z.object({
  exam_id: z.string().min(1, "exam_id is required"),
});

export type GetExamInstructionsInput = z.infer<typeof getExamInstructionsSchema>;
