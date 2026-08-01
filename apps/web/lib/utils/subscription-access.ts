import "server-only";
import { prisma } from "@repo/db";

// Access to an exam = OR of: is_free, an ExamPurchase exists, or an active
// (non-expired) Subscription grants it via SubscriptionExam. This is the single
// source of truth — used by both the listing gate and the attempt-start guard.
// Never assume free by default.

// bulk: which of these exam IDs the user can access. Renders the listing cards.
export async function getAccessibleExamIds(
  userId: string,
  examIds: string[],
): Promise<Set<string>> {
  if (examIds.length === 0) return new Set();

  const [freeOrPurchased, subGranted] = await Promise.all([
    prisma.exam.findMany({
      where: {
        id: { in: examIds },
        OR: [{ is_free: true }, { exam_purchases: { some: { user_id: userId } } }],
      },
      select: { id: true },
    }),
    prisma.subscriptionExam.findMany({
      where: {
        exam_id: { in: examIds },
        subscription: {
          user_id: userId,
          is_active: true,
          expires_at: { gt: new Date() },
        },
      },
      select: { exam_id: true },
    }),
  ]);

  const set = new Set<string>();
  for (const e of freeOrPurchased) set.add(e.id);
  for (const s of subGranted) set.add(s.exam_id);
  return set;
}

// single: the attempt-start guard calls this before creating an ExamAttempt.
export async function hasExamAccess(userId: string, examId: string): Promise<boolean> {
  const ids = await getAccessibleExamIds(userId, [examId]);
  return ids.has(examId);
}
