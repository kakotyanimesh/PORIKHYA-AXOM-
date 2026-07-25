"use server";

import { Prisma, prisma } from "@repo/db";
import { getCurrentUser } from "@/lib/utils/current-user";
import {
  startExamAttemptSchema,
  type StartExamAttemptInput,
} from "../validations/start-exam-attempt.validation";

export type StartExamAttemptResult =
  | { status: "started" }
  | { status: "already_attempted"; completed: boolean };

// the ExamAttempt row IS the one-attempt-ever lock — created here, at start,
// never at completion. @@unique([user_id, exam_id]) is what actually enforces
// it; the P2002 catch below just turns that DB-level rejection into a result
// the UI can show instead of a 500.
export async function startExamAttempt(
  input: StartExamAttemptInput,
): Promise<StartExamAttemptResult> {
  const parsed = startExamAttemptSchema.parse(input);
  const user = await getCurrentUser();

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
