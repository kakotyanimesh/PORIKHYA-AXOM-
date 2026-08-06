import { z } from "zod";

// Shared by the manual editor (Phase D) AND the JSON bulk import (Phase F).
// One source of truth so the two author paths can never write different shapes.

export const optionSchema = z.object({
  text: z.string().trim().min(1, "Option text is required"),
  text_assamese: z.string().trim().optional(),
  is_correct: z.boolean().default(false),
});
export type OptionInput = z.infer<typeof optionSchema>;

export const questionSchema = z
  .object({
    content: z.string().trim().min(1, "Question text is required"),
    content_assamese: z.string().trim().optional(),
    solution_text: z.string().trim().optional(),
    solution_text_assamese: z.string().trim().optional(),
    // null / undefined = exam-level (no subsection).
    subsection_id: z.string().min(1).nullish(),
    order: z.coerce.number().int().min(0).default(0),
    options: z.array(optionSchema).min(2, "At least 2 options required"),
  })
  .refine(
    (q) => q.options.filter((o) => o.is_correct).length === 1,
    { message: "Mark exactly one option as correct", path: ["options"] },
  );
export type QuestionInput = z.infer<typeof questionSchema>;

export const createQuestionSchema = questionSchema.and(
  z.object({ exam_id: z.string().min(1) }),
);

export const updateQuestionSchema = questionSchema.and(
  z.object({ id: z.string().min(1), exam_id: z.string().min(1) }),
);
