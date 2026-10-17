import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@repo/db";
import { getAccessibleExamIds } from "@/lib/utils/subscription-access";

// User status changes rarely compared with catalogue navigation. Key the cache
// by user and exam IDs, and invalidate the user's entries after a purchase or
// submission so the table reflects those writes immediately.
export async function getCachedMockTestStatus(
  userId: string,
  examIds: string[],
): Promise<{ completedExamIds: string[]; accessibleExamIds: string[] }> {
  "use cache";
  cacheTag(`exam-status:${userId}`);
  cacheLife({ stale: 60, revalidate: 60, expire: 300 });

  const [completed, accessible] = await Promise.all([
    prisma.examAttempt.findMany({
      where: { user_id: userId, exam_id: { in: examIds }, completed_at: { not: null } },
      select: { exam_id: true },
    }),
    getAccessibleExamIds(userId, examIds),
  ]);

  return {
    completedExamIds: completed.map((attempt) => attempt.exam_id),
    accessibleExamIds: [...accessible],
  };
}
