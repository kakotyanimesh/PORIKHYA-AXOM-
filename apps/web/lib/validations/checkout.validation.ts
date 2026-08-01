import { z } from "zod";

export const createExamOrderSchema = z.object({
  exam_id: z.string().min(1, "exam_id is required"),
});
export type CreateExamOrderInput = z.infer<typeof createExamOrderSchema>;

export const createPlanOrderSchema = z.object({
  plan_id: z.string().min(1, "plan_id is required"),
});
export type CreatePlanOrderInput = z.infer<typeof createPlanOrderSchema>;

// shape Razorpay's checkout.js handler hands back on success
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
