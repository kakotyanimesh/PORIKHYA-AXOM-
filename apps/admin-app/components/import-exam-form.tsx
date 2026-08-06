"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { Badge } from "@repo/ui/components/badge";
import {
  reportImport,
  commitImport,
  type ImportReport,
} from "@/lib/actions/import-exam.action";

export function ImportExamForm() {
  const router = useRouter();
  const [json, setJson] = useState("");
  const [report, setReport] = useState<ImportReport | null>(null);
  const [pending, startTransition] = useTransition();

  function handleValidate() {
    if (json.trim() === "") {
      toast.error("Paste the exam JSON first");
      return;
    }
    startTransition(async () => {
      setReport(await reportImport(json));
    });
  }

  function handleImport() {
    startTransition(async () => {
      const result = await commitImport(json);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`Imported ${result.questionCount} questions`);
      router.push(`/exams/${result.examId}/edit`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Textarea
        value={json}
        onChange={(e) => {
          setJson(e.target.value);
          setReport(null);
        }}
        placeholder='Paste the exam JSON here (the output of the pdf-to-mock-json prompt)'
        rows={14}
        className="font-mono text-xs"
      />

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleValidate} disabled={pending}>
          {pending && !report ? "Validating…" : "Validate"}
        </Button>
        <Button onClick={handleImport} disabled={pending || report?.ok !== true}>
          {pending && report?.ok ? "Importing…" : "Import"}
        </Button>
      </div>

      {report?.ok === true && (
        <div className="rounded-lg border border-green-600/30 bg-green-600/5 p-4 text-sm">
          <p className="font-medium text-green-700 dark:text-green-500">Looks good — ready to import</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-muted-foreground">Exam</dt>
            <dd>{report.examName}</dd>
            <dt className="text-muted-foreground">Series</dt>
            <dd>{report.seriesName}</dd>
            <dt className="text-muted-foreground">Category</dt>
            <dd>{report.category}</dd>
            <dt className="text-muted-foreground">Questions</dt>
            <dd>{report.questionCount}</dd>
            <dt className="text-muted-foreground">Subsections</dt>
            <dd className="flex flex-wrap gap-1">
              {report.sections.length === 0 ? (
                <span className="text-muted-foreground">none (exam-level)</span>
              ) : (
                report.sections.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)
              )}
            </dd>
          </dl>
        </div>
      )}

      {report?.ok === false && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">Fix these before importing</p>
          {report.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-1">
              {report.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
          {report.questionIssues.length > 0 && (
            <ul className="mt-2 space-y-1">
              {report.questionIssues.map((q) => (
                <li key={q.index}>
                  <span className="font-medium">{q.label}:</span> {q.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
