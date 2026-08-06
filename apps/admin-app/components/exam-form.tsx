"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Checkbox } from "@repo/ui/components/checkbox";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import {
  examSchema,
  EXAM_CATEGORIES,
} from "@/lib/validations/exam.validation";
import { createExam, updateExam } from "@/lib/actions/exam.action";

export type ExamFormValues = {
  id?: string;
  series_name: string;
  name: string;
  subject: string;
  category: (typeof EXAM_CATEGORIES)[number];
  duration_minutes: string;
  total_questions: string;
  negative_marking: string;
  pass_score_percent: string;
  is_free: boolean;
  is_pyq_public: boolean;
  is_active: boolean;
  image_url: string;
  year: string;
};

const EMPTY: ExamFormValues = {
  series_name: "",
  name: "",
  subject: "",
  category: "ASSAM_TET",
  duration_minutes: "",
  total_questions: "0",
  negative_marking: "0.25",
  pass_score_percent: "35",
  is_free: false,
  is_pyq_public: false,
  is_active: true,
  image_url: "",
  year: "",
};

export function ExamForm({ initial }: { initial?: ExamFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<ExamFormValues>(initial ?? EMPTY);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initial?.id);

  function set<K extends keyof ExamFormValues>(key: K, val: ExamFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = examSchema.safeParse({
      ...values,
      image_url: values.image_url.trim(),
      year: values.year.trim() === "" ? undefined : values.year,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    startTransition(async () => {
      const result =
        isEdit && initial?.id
          ? await updateExam({ id: initial.id, ...parsed.data })
          : await createExam(parsed.data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Exam updated" : "Exam created");
      router.push("/exams");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <Field label="Series name" hint="Groups exams on the student side. Keep it identical across a set, e.g. “Assam TET 2025”">
        <Input
          required
          value={values.series_name}
          onChange={(e) => set("series_name", e.target.value)}
          placeholder="e.g. Assam TET 2025"
        />
      </Field>
      <Field label="Exam name" hint="The one test's title — unique within the series">
        <Input
          required
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Assam TET Paper 1 — Mock Test 1"
        />
      </Field>
      <Field label="Subject" hint="Primary subject of this test">
        <Input
          required
          value={values.subject}
          onChange={(e) => set("subject", e.target.value)}
          placeholder="e.g. Child Development & Pedagogy"
        />
      </Field>

      <Field label="Category">
        <RadioGroup
          value={values.category}
          onValueChange={(val) => set("category", val as ExamFormValues["category"])}
          className="flex flex-wrap gap-4"
        >
          {EXAM_CATEGORIES.map((cat) => (
            <Label key={cat} className="flex items-center gap-2 font-normal">
              <RadioGroupItem value={cat} />
              {cat}
            </Label>
          ))}
        </RadioGroup>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Duration (minutes)" hint="Total time for the test">
          <Input
            type="number"
            required
            min={1}
            step={1}
            value={values.duration_minutes}
            onChange={(e) => set("duration_minutes", e.target.value)}
            placeholder="e.g. 120"
          />
        </Field>
        <Field label="Total questions" hint="Caps how many you can add. 0 = no cap">
          <Input
            type="number"
            required
            min={0}
            step={1}
            value={values.total_questions}
            onChange={(e) => set("total_questions", e.target.value)}
            placeholder="e.g. 150"
          />
        </Field>
        <Field label="Negative marking ratio" hint="Marks cut per wrong answer, e.g. 0.25">
          <Input
            type="number"
            required
            min={0}
            step="0.01"
            value={values.negative_marking}
            onChange={(e) => set("negative_marking", e.target.value)}
            placeholder="e.g. 0.25"
          />
        </Field>
        <Field label="Pass score %" hint="0–100">
          <Input
            type="number"
            required
            min={0}
            max={100}
            step="0.01"
            value={values.pass_score_percent}
            onChange={(e) => set("pass_score_percent", e.target.value)}
            placeholder="e.g. 35"
          />
        </Field>
        <Field label="Year (optional)" hint="Exam year, if relevant">
          <Input
            type="number"
            min={1900}
            max={2200}
            step={1}
            value={values.year}
            onChange={(e) => set("year", e.target.value)}
            placeholder="e.g. 2025"
          />
        </Field>
        <Field label="Image URL (optional)" hint="Full https:// link to a cover image">
          <Input
            type="url"
            value={values.image_url}
            onChange={(e) => set("image_url", e.target.value)}
            placeholder="https://…"
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        <CheckRow label="Free (one free attempt teaser)" checked={values.is_free} onChange={(c) => set("is_free", c)} />
        <CheckRow label="Public PYQ (SEO allowlist)" checked={values.is_pyq_public} onChange={(c) => set("is_pyq_public", c)} />
        <CheckRow label="Active (visible to students)" checked={values.is_active} onChange={(c) => set("is_active", c)} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create exam"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/exams")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <Label className="flex items-center gap-2 font-normal">
      <Checkbox checked={checked} onCheckedChange={(c) => onChange(c === true)} />
      {label}
    </Label>
  );
}
