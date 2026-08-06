"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { deleteExam } from "@/lib/actions/exam.action";

export function DeleteExamButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    // native confirm — admin-only tool, no dialog primitive needed.
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteExam(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Exam deleted");
      router.push("/exams");
      router.refresh();
    });
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
