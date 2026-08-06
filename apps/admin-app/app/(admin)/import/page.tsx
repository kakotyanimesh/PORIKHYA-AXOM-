import { ImportExamForm } from "@/components/import-exam-form";

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl font-medium">Import exam from JSON</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Bulk shortcut for whoever can produce the JSON (the pdf-to-mock-json
        prompt output). Creates the exam, its subsections, and every question in
        one go. Validate first — nothing is written until you click Import.
      </p>
      <ImportExamForm />
    </div>
  );
}
