import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { QuestionForm, type QuestionFormInitial } from "@/components/question-form";
import { AdminBreadcrumb } from "@/components/admin-breadcrumb";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string; qid: string }>;
}) {
  const { id, qid } = await params;
  const [exam, question] = await Promise.all([
    prisma.exam.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        subsections: { orderBy: { order: "asc" }, select: { id: true, name: true } },
      },
    }),
    prisma.question.findUnique({
      where: { id: qid },
      select: {
        id: true,
        subsection_id: true,
        content: true,
        content_assamese: true,
        solution_text: true,
        order: true,
        options: {
          orderBy: { order: "asc" },
          select: { text: true, text_assamese: true, is_correct: true },
        },
      },
    }),
  ]);
  if (!exam || !question || question.id !== qid) notFound();

  const initial: QuestionFormInitial = {
    id: question.id,
    subsection_id: question.subsection_id,
    content: question.content,
    content_assamese: question.content_assamese ?? "",
    solution_text: question.solution_text ?? "",
    order: question.order,
    options: question.options.map((o) => ({
      text: o.text,
      text_assamese: o.text_assamese ?? "",
      is_correct: o.is_correct,
    })),
  };

  return (
    <div className="mx-auto max-w-2xl">
      <AdminBreadcrumb
        items={[
          { label: "Exams", href: "/exams" },
          { label: exam.name, href: `/exams/${exam.id}/edit` },
          { label: "Questions", href: `/exams/${exam.id}/questions` },
          { label: "Edit question" },
        ]}
      />
      <h1 className="mb-6 font-heading text-2xl font-medium">Edit question</h1>
      <QuestionForm examId={exam.id} subsections={exam.subsections} initial={initial} />
    </div>
  );
}
