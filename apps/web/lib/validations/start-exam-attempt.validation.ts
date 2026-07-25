import { z } from "zod";

export const startExamAttemptSchema = z.object({
  exam_id: z.string().min(1, "exam_id is required"),
});

export type StartExamAttemptInput = z.infer<typeof startExamAttemptSchema>;
