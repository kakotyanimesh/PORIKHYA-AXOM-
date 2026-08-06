import { type Prisma } from "@repo/db";
import { type QuestionInput } from "../validations/question.validation";

/**
 * Shared create helper — the SINGLE place a Question + its Options get written.
 * Used by the manual editor AND the Phase F bulk import, so the two author
 * paths can never drift. Runs inside a transaction. `subsection_id` null =
 * exam-level. Caller must pass already-validated input AND enforce auth — this
 * is a plain server-side helper, never a server action (never exported from a
 * "use server" module, or it becomes a callable unauthenticated endpoint).
 */
export async function writeQuestion(
  tx: Prisma.TransactionClient,
  examId: string,
  input: QuestionInput,
): Promise<string> {
  const question = await tx.question.create({
    data: {
      exam_id: examId,
      subsection_id: input.subsection_id ?? null,
      content: input.content,
      content_assamese: input.content_assamese || null,
      solution_text: input.solution_text || null,
      solution_text_assamese: input.solution_text_assamese || null,
      order: input.order,
      options: {
        create: input.options.map((o, i) => ({
          text: o.text,
          text_assamese: o.text_assamese || null,
          is_correct: o.is_correct,
          order: i,
        })),
      },
    },
  });
  return question.id;
}
