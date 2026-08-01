"use server";

import { cacheLife, cacheTag } from "next/cache";
import { prisma, type Prisma } from "@repo/db";

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

const subscriptionSelect = {
  id: true,
  started_at: true,
  expires_at: true,
  plan: {
    select: { id: true, name: true, price: true, duration_days: true, category_grants: true },
  },
  _count: { select: { subscription_exams: true } },
} satisfies Prisma.SubscriptionSelect;

// Per-user, private cache. Invalidated explicitly when the user subscribes/cancels
// (updateTag(`subscription:${userId}`) in the checkout grant action). Plans stack,
// so a user can have several active subscriptions — return all, newest first.
export async function getMySubscriptions(
  userId: string,
): Promise<MySubscription[]> {
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
