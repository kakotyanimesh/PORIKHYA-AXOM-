import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { DeleteQuestionButton } from "@/components/delete-question-button";

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      total_questions: true,
      questions: {
        orderBy: [{ order: "asc" }, { created_at: "asc" }],
        select: {
          id: true,
          content: true,
          order: true,
          subsection: { select: { name: true } },
          options: { select: { is_correct: true, text: true } },
        },
      },
    },
  });
  if (!exam) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-medium">Questions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {exam.name} — {exam.questions.length} added
            {exam.total_questions ? ` / ${exam.total_questions} planned` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" render={<Link href={`/exams/${exam.id}/edit`} />}>
            Back to exam
          </Button>
          <Button render={<Link href={`/exams/${exam.id}/questions/new`} />}>New question</Button>
        </div>
      </div>

      {exam.questions.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No questions yet. Add the first one.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {exam.questions.map((q, i) => {
            const correct = q.options.find((o) => o.is_correct);
            return (
              <li key={q.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">
                      <span className="text-muted-foreground">{i + 1}.</span> {q.content}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">{q.options.length} options</Badge>
                      {q.subsection ? (
                        <Badge variant="outline">{q.subsection.name}</Badge>
                      ) : (
                        <Badge variant="outline">Exam-level</Badge>
                      )}
                      {correct ? (
                        <span>Correct: {correct.text}</span>
                      ) : (
                        <span className="text-destructive">No correct answer!</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/exams/${exam.id}/questions/${q.id}/edit`} />}
                    >
                      Edit
                    </Button>
                    <DeleteQuestionButton id={q.id} examId={exam.id} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
