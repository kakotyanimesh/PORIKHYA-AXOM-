"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { questionSchema, type QuestionInput } from "@/lib/validations/question.validation";
import { createQuestionsBatch } from "@/lib/actions/question.action";
import {
  QuestionFields,
  validateDraft,
  draftToInput,
  emptyDraft,
  type QuestionDraft,
} from "@/components/question-fields";

type Staged = { key: number; draft: QuestionDraft; correctIndex: number };

export function QuestionBuilder({
  examId,
  examName,
  subsections,
  remaining,
  startOrder,
}: {
  examId: string;
  examName: string;
  subsections: { id: string; name: string }[];
  remaining?: number; // total_questions - current; undefined = uncapped
  startOrder: number;
}) {
  const router = useRouter();
  const [staged, setStaged] = useState<Staged[]>([]);
  const [draft, setDraft] = useState<QuestionDraft>(emptyDraft(startOrder));
  const [correctIndex, setCorrectIndex] = useState<number>(-1);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [nextKey, setNextKey] = useState(1);
  const [pending, startTransition] = useTransition();

  const left = remaining === undefined ? undefined : remaining - staged.length;
  const full = left !== undefined && left <= 0 && editingKey === null;

  function resetDraft() {
    setDraft((d) => ({ ...emptyDraft(startOrder + staged.length + 1), subsection_id: d.subsection_id }));
    setCorrectIndex(-1);
    setEditingKey(null);
  }

  function addToList(e: FormEvent) {
    e.preventDefault();
    const err = validateDraft(draft, correctIndex);
    if (err) {
      toast.error(err);
      return;
    }
    if (editingKey !== null) {
      setStaged((prev) => prev.map((s) => (s.key === editingKey ? { ...s, draft, correctIndex } : s)));
      toast.success("Updated in list");
    } else {
      if (full) {
        toast.error("Reached the exam's question limit");
        return;
      }
      setStaged((prev) => [...prev, { key: nextKey, draft, correctIndex }]);
      setNextKey((k) => k + 1);
      toast.success("Added to list");
    }
    resetDraft();
  }

  function editStaged(item: Staged) {
    setDraft(item.draft);
    setCorrectIndex(item.correctIndex);
    setEditingKey(item.key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeStaged(key: number) {
    setStaged((prev) => prev.filter((s) => s.key !== key));
    if (editingKey === key) resetDraft();
  }

  function saveAll() {
    if (staged.length === 0) {
      toast.error("Add at least one question to the list first");
      return;
    }
    const questions: QuestionInput[] = [];
    for (const s of staged) {
      const parsed = questionSchema.safeParse(draftToInput(s.draft, s.correctIndex));
      if (!parsed.success) {
        toast.error(`A staged question is invalid: ${parsed.error.issues[0]?.message}`);
        return;
      }
      questions.push(parsed.data);
    }
    startTransition(async () => {
      const result = await createQuestionsBatch({ exam_id: examId, questions });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`Saved ${result.count} question${result.count === 1 ? "" : "s"}`);
      router.push(`/exams/${examId}/questions`);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      {/* editor */}
      <form onSubmit={addToList} className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            {editingKey !== null ? `Editing question in list` : "New question"}
          </h2>
          {editingKey === null && left !== undefined && (
            <span className="text-sm text-muted-foreground">{Math.max(left, 0)} more allowed</span>
          )}
        </div>

        <QuestionFields
          draft={draft}
          setDraft={setDraft}
          correctIndex={correctIndex}
          setCorrectIndex={setCorrectIndex}
          subsections={subsections}
          disabled={pending}
        />

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={pending || full}
            className="transition-transform active:scale-[0.98]"
          >
            {editingKey !== null ? "Update in list" : "Add to list"}
          </Button>
          {editingKey !== null && (
            <Button
              type="button"
              variant="outline"
              onClick={resetDraft}
              className="transition-transform active:scale-[0.98]"
            >
              Cancel edit
            </Button>
          )}
          {full && (
            <p className="w-full text-sm text-destructive">
              Reached the limit ({remaining}). Remove one, or raise the exam&apos;s Total questions.
            </p>
          )}
        </div>
      </form>

      {/* staged list — sticky on desktop */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-medium">
            In list <span className="text-muted-foreground">({staged.length})</span>
          </h2>
        </div>

        {staged.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Questions you add show up here. Nothing is saved until you press
            <span className="font-medium text-foreground"> Save all</span>.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {staged.map((s, i) => {
              const correctText = s.draft.options[s.correctIndex]?.text ?? "";
              const optionCount = s.draft.options.filter((o) => o.text.trim() !== "").length;
              return (
                <li
                  key={s.key}
                  className={[
                    "rounded-xl border p-3 duration-200 animate-in fade-in slide-in-from-bottom-1",
                    editingKey === s.key ? "border-foreground/40 bg-muted/40" : "border-border",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 text-sm">
                      <span className="text-muted-foreground">{i + 1}.</span>{" "}
                      <span className="line-clamp-2">{s.draft.content || "Untitled"}</span>
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge variant="secondary">{optionCount} opts</Badge>
                    <span className="truncate text-green-700 dark:text-green-500">✓ {correctText}</span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editStaged(s)}
                      disabled={pending}
                      className="h-7 px-2 text-xs transition-transform active:scale-95"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStaged(s.key)}
                      disabled={pending}
                      className="h-7 px-2 text-xs transition-transform active:scale-95"
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <Button
          type="button"
          onClick={saveAll}
          disabled={pending || staged.length === 0}
          className="transition-transform active:scale-[0.98]"
        >
          {pending ? "Saving…" : `Save all ${staged.length || ""}`.trim()}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/exams/${examId}/questions`)}
          disabled={pending}
          className="transition-transform active:scale-[0.98]"
        >
          {staged.length > 0 ? "Discard & leave" : "Cancel"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">{examName}</p>
      </aside>
    </div>
  );
}
