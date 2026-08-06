import { ExamForm } from "@/components/exam-form";
import { AdminBreadcrumb } from "@/components/admin-breadcrumb";

export default function NewExamPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <AdminBreadcrumb
        items={[{ label: "Exams", href: "/exams" }, { label: "New exam" }]}
      />
      <h1 className="font-heading text-2xl font-medium">New exam</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Add questions after saving.
      </p>
      <ExamForm />
    </div>
  );
}
