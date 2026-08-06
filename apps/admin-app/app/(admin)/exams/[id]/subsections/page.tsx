import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { SubsectionManager, type SubsectionRow } from "@/components/subsection-manager";
import { AdminBreadcrumb } from "@/components/admin-breadcrumb";

export default async function SubsectionsPage({
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
      subsections: {
        orderBy: [{ order: "asc" }, { created_at: "asc" }],
        select: {
          id: true,
          name: true,
          marks_per_question: true,
          negative_marking_ratio: true,
          order: true,
          _count: { select: { questions: true } },
        },
      },
    },
  });
  if (!exam) notFound();

  const rows: SubsectionRow[] = exam.subsections.map((s) => ({
    id: s.id,
    name: s.name,
    marks_per_question: s.marks_per_question?.toString() ?? null,
    negative_marking_ratio: s.negative_marking_ratio?.toString() ?? null,
    order: s.order,
    questionCount: s._count.questions,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <AdminBreadcrumb
        items={[
          { label: "Exams", href: "/exams" },
          { label: exam.name, href: `/exams/${exam.id}/edit` },
          { label: "Subsections" },
        ]}
      />
      <h1 className="font-heading text-2xl font-medium">Subsections</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Subsections override the exam&apos;s marks and negative-marking. Leave a
        field blank to inherit the exam value.
      </p>
      <SubsectionManager examId={exam.id} subsections={rows} />
    </div>
  );
}
