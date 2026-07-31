"use server";

import { cacheLife, cacheTag } from "next/cache";
import { prisma, type Prisma } from "@repo/db";

// Decimal → number and enum[] → string[] at the boundary so client components get
// plain JSON. category_grants values are strings at runtime.
export type MySubscription = {
  id: string;
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

const subscriptionSelect = {
  id: true,
  started_at: true,
  expires_at: true,
  plan: {
    select: { name: true, price: true, duration_days: true, category_grants: true },
  },
  _count: { select: { subscription_exams: true } },
} satisfies Prisma.SubscriptionSelect;

// Per-user, private cache. Invalidated explicitly when the user subscribes/cancels
// (revalidateTag(`subscription:${userId}`) in the checkout grant action).
// One active Subscription per user (partial unique index), so findFirst is safe.
export async function getMySubscription(
  userId: string,
): Promise<MySubscription | null> {
  "use cache: private";
  cacheLife("days");
  cacheTag(`subscription:${userId}`);

  const sub = await prisma.subscription.findFirst({
    where: { user_id: userId, is_active: true },
    select: subscriptionSelect,
  });
  if (!sub) return null;

  return {
    id: sub.id,
    planName: sub.plan.name,
    price: Number(sub.plan.price),
    durationDays: sub.plan.duration_days,
    categoryGrants: sub.plan.category_grants,
    startedAt: sub.started_at,
    expiresAt: sub.expires_at,
    examCount: sub._count.subscription_exams,
  };
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
