"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { deleteQuestion } from "@/lib/actions/question.action";

export function DeleteQuestionButton({ id, examId }: { id: string; examId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteQuestion(id, examId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Question deleted");
      router.refresh();
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={pending}>
      Delete
    </Button>
  );
}
