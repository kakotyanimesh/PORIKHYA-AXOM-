"use client";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";

export type OptionDraft = { text: string; text_assamese: string };

export type QuestionDraft = {
  content: string;
  content_assamese: string;
  solution_text: string;
  subsection_id: string; // "" = exam-level
  order: string;
  options: OptionDraft[];
};

export const blankOptions = (): OptionDraft[] => [
  { text: "", text_assamese: "" },
  { text: "", text_assamese: "" },
  { text: "", text_assamese: "" },
  { text: "", text_assamese: "" },
];

export const emptyDraft = (order = 0): QuestionDraft => ({
  content: "",
  content_assamese: "",
  solution_text: "",
  subsection_id: "",
  order: String(order),
  options: blankOptions(),
});

/** Presentational — parent owns state. Shared by the edit form and the batch builder. */
export function QuestionFields({
  draft,
  setDraft,
  correctIndex,
  setCorrectIndex,
  subsections,
  disabled,
}: {
  draft: QuestionDraft;
  setDraft: (updater: (d: QuestionDraft) => QuestionDraft) => void;
  correctIndex: number;
  setCorrectIndex: (i: number) => void;
  subsections: { id: string; name: string }[];
  disabled?: boolean;
}) {
  function setOption(i: number, key: keyof OptionDraft, val: string) {
    setDraft((d) => ({
      ...d,
      options: d.options.map((o, idx) => (idx === i ? { ...o, [key]: val } : o)),
    }));
  }
  function addOption() {
    setDraft((d) => ({ ...d, options: [...d.options, { text: "", text_assamese: "" }] }));
  }
  function removeOption(i: number) {
    if (draft.options.length <= 2) return;
    setDraft((d) => ({ ...d, options: d.options.filter((_, idx) => idx !== i) }));
    if (correctIndex === i) setCorrectIndex(-1);
    else if (correctIndex > i) setCorrectIndex(correctIndex - 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>Question</Label>
        <Textarea
          required
          value={draft.content}
          onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
          placeholder="e.g. Who is the current Chief Minister of Assam?"
          rows={3}
          disabled={disabled}
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground">Question in Assamese (optional)</Label>
        <Textarea
          value={draft.content_assamese}
          onChange={(e) => setDraft((d) => ({ ...d, content_assamese: e.target.value }))}
          rows={2}
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label>Options — tap the circle beside the correct answer</Label>
        <RadioGroup
          value={correctIndex >= 0 ? String(correctIndex) : ""}
          onValueChange={(v) => setCorrectIndex(Number(v))}
          className="flex flex-col gap-2.5"
        >
          {draft.options.map((opt, i) => {
            const isCorrect = correctIndex === i;
            return (
              <div
                key={i}
                className={[
                  "flex items-start gap-3 rounded-xl border p-3 transition-colors duration-150",
                  isCorrect
                    ? "border-green-600/50 bg-green-600/5"
                    : "border-border hover:border-foreground/20",
                ].join(" ")}
              >
                <RadioGroupItem
                  value={String(i)}
                  className="mt-2.5"
                  aria-label={`Mark option ${i + 1} correct`}
                  disabled={disabled}
                />
                <div className="flex flex-1 flex-col gap-2">
                  <Input
                    value={opt.text}
                    onChange={(e) => setOption(i, "text", e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    disabled={disabled}
                  />
                  <Input
                    value={opt.text_assamese}
                    onChange={(e) => setOption(i, "text_assamese", e.target.value)}
                    placeholder={`Option ${i + 1} in Assamese (optional)`}
                    className="text-sm"
                    disabled={disabled}
                  />
                </div>
                {isCorrect && (
                  <span className="mt-1.5 text-xs font-medium text-green-700 dark:text-green-500">
                    Correct
                  </span>
                )}
                {draft.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(i)}
                    disabled={disabled}
                    className="transition-transform active:scale-95"
                  >
                    Remove
                  </Button>
                )}
              </div>
            );
          })}
        </RadioGroup>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          disabled={disabled}
          className="self-start transition-transform active:scale-95"
        >
          Add option
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground">Solution / explanation (optional)</Label>
        <Textarea
          value={draft.solution_text}
          onChange={(e) => setDraft((d) => ({ ...d, solution_text: e.target.value }))}
          rows={2}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Subsection</Label>
          <RadioGroup
            value={draft.subsection_id}
            onValueChange={(v) => setDraft((d) => ({ ...d, subsection_id: v }))}
            className="flex flex-col gap-2"
          >
            <Label className="flex items-center gap-2 font-normal">
              <RadioGroupItem value="" disabled={disabled} />
              Exam-level (no subsection)
            </Label>
            {subsections.map((s) => (
              <Label key={s.id} className="flex items-center gap-2 font-normal">
                <RadioGroupItem value={s.id} disabled={disabled} />
                {s.name}
              </Label>
            ))}
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground">Order</Label>
          <Input
            type="number"
            min={0}
            step={1}
            value={draft.order}
            onChange={(e) => setDraft((d) => ({ ...d, order: e.target.value }))}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

/** Shared client-side check before staging/saving. Returns an error string or null. */
export function validateDraft(draft: QuestionDraft, correctIndex: number): string | null {
  if (draft.content.trim() === "") return "Type the question first";
  const filled = draft.options.filter((o) => o.text.trim() !== "");
  if (filled.length < 2) return "Fill at least 2 options";
  if (correctIndex < 0 || draft.options[correctIndex]?.text.trim() === "")
    return "Tap the circle beside the correct answer";
  return null;
}

/** Map a draft to the server QuestionInput shape (drops blank option rows). */
export function draftToInput(draft: QuestionDraft, correctIndex: number) {
  const kept = draft.options
    .map((o, i) => ({ ...o, wasCorrect: i === correctIndex }))
    .filter((o) => o.text.trim() !== "");
  return {
    content: draft.content,
    content_assamese: draft.content_assamese,
    solution_text: draft.solution_text,
    subsection_id: draft.subsection_id === "" ? null : draft.subsection_id,
    order: draft.order,
    options: kept.map((o) => ({
      text: o.text,
      text_assamese: o.text_assamese,
      is_correct: o.wasCorrect,
    })),
  };
}
