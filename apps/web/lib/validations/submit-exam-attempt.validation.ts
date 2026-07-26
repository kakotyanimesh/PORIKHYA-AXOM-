import { z } from "zod";

export const submitExamAttemptSchema = z.object({
  exam_id: z.string().min(1, "exam_id is required"),
  answers: z.array(
    z.object({
      question_id: z.string().min(1),
      selected_option_id: z.string().min(1),
    }),
  ),
});

export type SubmitExamAttemptInput = z.infer<typeof submitExamAttemptSchema>;
