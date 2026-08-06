import { z } from "zod";

// override fields are optional: empty = inherit the parent Exam's values.
const optionalDecimal = z
  .union([z.coerce.number().min(0), z.literal("").transform(() => undefined)])
  .optional();

export const subsectionSchema = z.object({
  exam_id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required"),
  marks_per_question: optionalDecimal,
  negative_marking_ratio: optionalDecimal,
  order: z.coerce.number().int().min(0).default(0),
});
export type SubsectionInput = z.infer<typeof subsectionSchema>;

export const updateSubsectionSchema = subsectionSchema.extend({
  id: z.string().min(1),
});
export type UpdateSubsectionInput = z.infer<typeof updateSubsectionSchema>;
