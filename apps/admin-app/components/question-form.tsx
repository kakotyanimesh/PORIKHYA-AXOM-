"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { questionSchema } from "@/lib/validations/question.validation";
import { updateQuestion } from "@/lib/actions/question.action";
import {
  QuestionFields,
  validateDraft,
  draftToInput,
  type QuestionDraft,
} from "@/components/question-fields";

export type QuestionFormInitial = {
  id: string;
  subsection_id: string | null;
  content: string;
  content_assamese: string;
  solution_text: string;
  order: number;
  options: { text: string; text_assamese: string; is_correct: boolean }[];
};

// Edit a single existing question. (Adding new questions uses QuestionBuilder.)
export function QuestionForm({
  examId,
  subsections,
  initial,
}: {
  examId: string;
  subsections: { id: string; name: string }[];
  initial: QuestionFormInitial;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<QuestionDraft>({
    content: initial.content,
    content_assamese: initial.content_assamese,
    solution_text: initial.solution_text,
    subsection_id: initial.subsection_id ?? "",
    order: String(initial.order),
    options: initial.options.map((o) => ({ text: o.text, text_assamese: o.text_assamese })),
  });
  const [correctIndex, setCorrectIndex] = useState<number>(
    initial.options.findIndex((o) => o.is_correct),
  );
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clientErr = validateDraft(draft, correctIndex);
    if (clientErr) {
      toast.error(clientErr);
      return;
    }
    const parsed = questionSchema.safeParse(draftToInput(draft, correctIndex));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    startTransition(async () => {
      const result = await updateQuestion({ id: initial.id, exam_id: examId, ...parsed.data });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Question saved");
      router.push(`/exams/${examId}/questions`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <QuestionFields
        draft={draft}
        setDraft={setDraft}
        correctIndex={correctIndex}
        setCorrectIndex={setCorrectIndex}
        subsections={subsections}
        disabled={pending}
      />
      <div className="flex gap-3">
        <Button type="submit" disabled={pending} className="transition-transform active:scale-[0.98]">
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/exams/${examId}/questions`)}
          className="transition-transform active:scale-[0.98]"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
