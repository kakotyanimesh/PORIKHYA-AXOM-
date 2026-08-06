import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import { ExamForm, type ExamFormValues } from "@/components/exam-form";
import { DeleteExamButton } from "@/components/delete-exam-button";
import { AdminBreadcrumb } from "@/components/admin-breadcrumb";
import { EXAM_CATEGORIES } from "@/lib/validations/exam.validation";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) notFound();

  const initial: ExamFormValues = {
    id: exam.id,
    series_name: exam.series_name,
    name: exam.name,
    subject: exam.subject,
    category: EXAM_CATEGORIES.includes(exam.category) ? exam.category : "OTHER",
    duration_minutes: String(exam.duration_minutes),
    total_questions: String(exam.total_questions),
    negative_marking: exam.negative_marking.toString(),
    pass_score_percent: exam.pass_score_percent.toString(),
    is_free: exam.is_free,
    is_pyq_public: exam.is_pyq_public,
    is_active: exam.is_active,
    image_url: exam.image_url ?? "",
    year: exam.year != null ? String(exam.year) : "",
  };

  return (
    <div className="mx-auto max-w-2xl">
      <AdminBreadcrumb
        items={[{ label: "Exams", href: "/exams" }, { label: exam.name }]}
      />
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium">Edit exam</h1>
        <DeleteExamButton id={exam.id} name={exam.name} />
      </div>
      <div className="mt-4 mb-6 flex gap-2">
        <Button variant="outline" size="sm" render={<Link href={`/exams/${exam.id}/questions`} />}>
          Manage questions
        </Button>
        <Button variant="outline" size="sm" render={<Link href={`/exams/${exam.id}/subsections`} />}>
          Manage subsections
        </Button>
      </div>
      <ExamForm initial={initial} />
    </div>
  );
}
