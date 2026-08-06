import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { QuestionBuilder } from "@/components/question-builder";
import { AdminBreadcrumb } from "@/components/admin-breadcrumb";

export default async function NewQuestionPage({
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
      subsections: { orderBy: { order: "asc" }, select: { id: true, name: true } },
      _count: { select: { questions: true } },
    },
  });
  if (!exam) notFound();

  const current = exam._count.questions;
  const remaining = exam.total_questions > 0 ? exam.total_questions - current : undefined;

  return (
    <div className="mx-auto max-w-5xl">
      <AdminBreadcrumb
        items={[
          { label: "Exams", href: "/exams" },
          { label: exam.name, href: `/exams/${exam.id}/edit` },
          { label: "Questions", href: `/exams/${exam.id}/questions` },
          { label: "Add" },
        ]}
      />
      <h1 className="font-heading text-2xl font-medium">Add questions</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Build your list, then save them all at once.
      </p>
      <QuestionBuilder
        examId={exam.id}
        examName={exam.name}
        subsections={exam.subsections}
        remaining={remaining}
        startOrder={current}
      />
    </div>
  );
}
