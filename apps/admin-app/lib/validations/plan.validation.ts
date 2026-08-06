import { z } from "zod";
import { EXAM_CATEGORIES } from "./exam.validation";

export const planSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  duration_days: z.coerce.number().int().positive("Duration must be > 0 days"),
  category_grants: z
    .array(z.enum(EXAM_CATEGORIES))
    .min(1, "Pick at least one category to grant"),
  is_active: z.boolean().default(true),
});
export type PlanInput = z.infer<typeof planSchema>;

export const updatePlanSchema = planSchema.extend({
  id: z.string().min(1),
});
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
