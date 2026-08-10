"use server";

import { cacheLife, cacheTag } from "next/cache";
import { prisma, type Prisma } from "@repo/db";
import { getCurrentUser } from "@/lib/utils/current-user";

// Decimal → number and enum[] → string[] at the boundary so client components get
// plain JSON. category_grants values are strings at runtime.
export type MySubscription = {
  id: string;
  planId: string;
  planName: string;
  price: number;
  durationDays: number;
  categoryGrants: string[];
  startedAt: Date;
  expiresAt: Date;
  examCount: number; // exams granted via SubscriptionExam
};

export type PlanOption = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  categoryGrants: string[];
};

// one buyable duration of a category plan (e.g. ₹499 / 365d)
export type PlanDuration = {
  planId: string;
  price: number;
  durationDays: number;
};

// a category grouped across its durations — one unlock card per group,
// the card's toggle picks which PlanDuration to buy
export type CategoryPlanGroup = {
  category: string; // ExamCategory value
  durations: PlanDuration[]; // sorted shortest → longest
};

export type PlanCatalog = {
  superPlan: PlanOption | null; // the multi-category bundle, shown on its own
  categories: CategoryPlanGroup[];
};

const subscriptionSelect = {
  id: true,
  started_at: true,
  expires_at: true,
  plan: {
    select: { id: true, name: true, price: true, duration_days: true, category_grants: true },
  },
  _count: { select: { subscription_exams: true } },
} satisfies Prisma.SubscriptionSelect;

// Identity comes from the session, never from a caller-supplied argument — this
// is an exported action, so a userId param would be a trivial IDOR (read anyone's
// subs). getCurrentUser's redirect stays outside the "use cache" boundary by
// living in this wrapper, not the cached fetch below.
export async function getMySubscriptions(): Promise<MySubscription[]> {
  const user = await getCurrentUser();
  return fetchMySubscriptions(user.id);
}

// Per-user, private cache. Invalidated explicitly when the user subscribes/cancels
// (updateTag(`subscription:${userId}`) in the checkout grant action). Plans stack,
// so a user can have several active subscriptions — return all, newest first.
async function fetchMySubscriptions(userId: string): Promise<MySubscription[]> {
  "use cache: private";
  cacheLife("days");
  cacheTag(`subscription:${userId}`);

  const subs = await prisma.subscription.findMany({
    where: { user_id: userId, is_active: true },
    orderBy: { started_at: "desc" },
    select: subscriptionSelect,
  });

  return subs.map((sub) => ({
    id: sub.id,
    planId: sub.plan.id,
    planName: sub.plan.name,
    price: Number(sub.plan.price),
    durationDays: sub.plan.duration_days,
    categoryGrants: sub.plan.category_grants,
    startedAt: sub.started_at,
    expiresAt: sub.expires_at,
    examCount: sub._count.subscription_exams,
  }));
}

// Shared (not per-user) catalogue. Long-lived → lands in the static shell.
// Invalidated when plans are edited (revalidateTag("plans:all") in admin).
export async function getActivePlans(): Promise<PlanOption[]> {
  "use cache";
  cacheTag("plans:all");
  cacheLife({ stale: 300, revalidate: 60 * 60 * 15, expire: 60 * 60 * 24 });

  const plans = await prisma.plan.findMany({
    where: { is_active: true },
    orderBy: { price: "asc" },
    select: {
      id: true,
      name: true,
      price: true,
      duration_days: true,
      category_grants: true,
    },
  });

  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    durationDays: p.duration_days,
    categoryGrants: p.category_grants,
  }));
}

// Categories that actually have exams in the DB. A plan for a category with no
// content sells access to nothing, so the catalog below hides it. Cached and
// invalidated when exams are added/removed (revalidateTag("exam-categories")).
async function getCategoriesWithExams(): Promise<string[]> {
  "use cache";
  cacheTag("exam-categories");
  cacheLife({ stale: 300, revalidate: 60 * 60 * 15, expire: 60 * 60 * 24 });

  const rows = await prisma.exam.findMany({
    where: { is_active: true },
    distinct: ["category"],
    select: { category: true },
  });
  return rows.map((r) => r.category);
}

// Reshape the flat plan list for the subscriptions UI: the multi-category
// bundle split out as `superPlan`, single-category plans grouped so each
// category renders one card with a duration toggle. Categories with no exams
// are dropped — never sell access to empty content.
export async function getPlanCatalog(): Promise<PlanCatalog> {
  const [plans, liveCategories] = await Promise.all([
    getActivePlans(),
    getCategoriesWithExams(),
  ]);
  const live = new Set(liveCategories);

  let superPlan: PlanOption | null = null;
  const byCategory = new Map<string, PlanDuration[]>();

  for (const p of plans) {
    if (p.categoryGrants.length !== 1) {
      superPlan = p; // multi-category bundle (or a stray no-grant plan)
      continue;
    }
    const category = p.categoryGrants[0]!;
    if (!live.has(category)) continue; // no exams in this category — skip
    const durations = byCategory.get(category) ?? [];
    durations.push({
      planId: p.id,
      price: p.price,
      durationDays: p.durationDays,
    });
    byCategory.set(category, durations);
  }

  const categories: CategoryPlanGroup[] = [...byCategory.entries()]
    .map(([category, durations]) => ({
      category,
      durations: durations.sort((a, b) => a.durationDays - b.durationDays),
    }))
    .sort((a, b) => orderIndex(a.category) - orderIndex(b.category));

  // the super bundle is only a real bundle if ≥2 of its categories have content
  if (superPlan) {
    const liveGrants = superPlan.categoryGrants.filter((c) => live.has(c));
    if (liveGrants.length < 2) superPlan = null;
  }

  return { superPlan, categories };
}

const CATEGORY_ORDER = ["ASSAM_TET", "ADRE", "ASSAM_POLICE", "APSC"];
function orderIndex(c: string): number {
  const i = CATEGORY_ORDER.indexOf(c);
  return i === -1 ? CATEGORY_ORDER.length : i;
}
