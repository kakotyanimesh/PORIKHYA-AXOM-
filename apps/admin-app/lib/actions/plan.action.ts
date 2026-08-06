"use server";

import { updateTag } from "next/cache";
import { prisma } from "@repo/db";
import { requireAdmin } from "@/lib/utils/require-admin";
import {
  planSchema,
  updatePlanSchema,
  type PlanInput,
  type UpdatePlanInput,
} from "../validations/plan.validation";

export type PlanActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

function invalidate() {
  updateTag("plans:all");
}

function toData(input: PlanInput) {
  return {
    name: input.name,
    price: input.price,
    duration_days: input.duration_days,
    category_grants: input.category_grants,
    is_active: input.is_active,
  };
}

export async function createPlan(input: PlanInput): Promise<PlanActionResult> {
  await requireAdmin();
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const plan = await prisma.plan.create({ data: toData(parsed.data) });
  invalidate();
  return { success: true, id: plan.id };
}

export async function updatePlan(input: UpdatePlanInput): Promise<PlanActionResult> {
  await requireAdmin();
  const parsed = updatePlanSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { id, ...rest } = parsed.data;
  const plan = await prisma.plan.update({ where: { id }, data: toData(rest) });
  invalidate();
  return { success: true, id: plan.id };
}

export async function deletePlan(id: string): Promise<PlanActionResult> {
  await requireAdmin();
  if (!id) return { success: false, error: "id is required" };
  try {
    await prisma.plan.delete({ where: { id } });
    invalidate();
    return { success: true, id };
  } catch {
    // FK Restrict: plan has subscriptions — never orphan a paid subscription.
    return {
      success: false,
      error: "Cannot delete — plan has subscriptions. Set it inactive instead.",
    };
  }
}
