"use server";

import { Prisma, prisma } from "@repo/db";
import { getCurrentUser } from "@/lib/utils/current-user";
import { hasExamAccess } from "@/lib/utils/subscription-access";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import {
  startExamAttemptSchema,
  type StartExamAttemptInput,
} from "../validations/start-exam-attempt.validation";

export type StartExamAttemptResult =
  | { status: "started" }
  | { status: "already_attempted"; completed: boolean }
  | { status: "no_access" };

// the ExamAttempt row IS the one-attempt-ever lock — created here, at start,
// never at completion. @@unique([user_id, exam_id]) is what actually enforces
// it; the P2002 catch below just turns that DB-level rejection into a result
// the UI can show instead of a 500.
export async function startExamAttempt(
  input: StartExamAttemptInput,
): Promise<StartExamAttemptResult> {
  const parsed = startExamAttemptSchema.parse(input);
  const user = await getCurrentUser();
  await enforceRateLimit({ name: "start-exam-attempt", limit: 5, windowSeconds: 60, identity: user.id });

  // A published answer-key exam (is_pyq_public) is never attemptable — its
  // solutions are public on the PYQ page, so grading it would be meaningless and
  // trivially gameable. Refuse before the access gate and the one-attempt lock
  // (F1 guard). Mutation-boundary backstop to the listing/instructions exclusion.
  const exam = await prisma.exam.findUnique({
    where: { id: parsed.exam_id },
    select: { is_pyq_public: true },
  });
  if (!exam || exam.is_pyq_public) {
    return { status: "no_access" };
  }

  // gate BEFORE the lock — a paid exam must not burn its one attempt for a user
  // who never paid. Same access rule as the listing cards (shared helper).
  if (!(await hasExamAccess(user.id, parsed.exam_id))) {
    return { status: "no_access" };
  }

  try {
    await prisma.examAttempt.create({
      data: { user_id: user.id, exam_id: parsed.exam_id },
    });
    return { status: "started" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await prisma.examAttempt.findUniqueOrThrow({
        where: { user_id_exam_id: { user_id: user.id, exam_id: parsed.exam_id } },
        select: { completed_at: true },
      });
      return { status: "already_attempted", completed: existing.completed_at !== null };
    }
    throw error;
  }
}

export type ExamAttemptStatus = { attempted: false } | { attempted: true; completed: boolean };

// read-only check for the instructions page — must run before rendering the
// Start Test gate, not just react to a click, or a reload silently re-offers
// a start button for an exam already locked
export async function getExamAttemptStatus(
  input: StartExamAttemptInput,
): Promise<ExamAttemptStatus> {
  const parsed = startExamAttemptSchema.parse(input);
  const user = await getCurrentUser();

  const existing = await prisma.examAttempt.findUnique({
    where: { user_id_exam_id: { user_id: user.id, exam_id: parsed.exam_id } },
    select: { completed_at: true },
  });

  return existing ? { attempted: true, completed: existing.completed_at !== null } : { attempted: false };
}

// bulk version for listing tables — never cached (user-specific, must reflect
// a submit that just happened), so there's no tag to invalidate
export async function getCompletedExamIds(examIds: string[]): Promise<Set<string>> {
  if (examIds.length === 0) return new Set();
  const user = await getCurrentUser();

  const completed = await prisma.examAttempt.findMany({
    where: { user_id: user.id, exam_id: { in: examIds }, completed_at: { not: null } },
    select: { exam_id: true },
  });
  return new Set(completed.map((a) => a.exam_id));
}
