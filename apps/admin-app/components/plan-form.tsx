"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Checkbox } from "@repo/ui/components/checkbox";
import { planSchema } from "@/lib/validations/plan.validation";
import { EXAM_CATEGORIES } from "@/lib/validations/exam.validation";
import { createPlan, updatePlan } from "@/lib/actions/plan.action";

type Category = (typeof EXAM_CATEGORIES)[number];

export type PlanFormValues = {
  id?: string;
  name: string;
  price: string;
  duration_days: string;
  category_grants: Category[];
  is_active: boolean;
};

const EMPTY: PlanFormValues = {
  name: "",
  price: "",
  duration_days: "180",
  category_grants: [],
  is_active: true,
};

export function PlanForm({ initial }: { initial?: PlanFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<PlanFormValues>(initial ?? EMPTY);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initial?.id);

  function toggleCategory(cat: Category, on: boolean) {
    setValues((v) => ({
      ...v,
      category_grants: on
        ? [...v.category_grants, cat]
        : v.category_grants.filter((c) => c !== cat),
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = planSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    startTransition(async () => {
      const result =
        isEdit && initial?.id
          ? await updatePlan({ id: initial.id, ...parsed.data })
          : await createPlan(parsed.data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Plan updated" : "Plan created");
      router.push("/plans");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label>Name</Label>
        <Input
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder="e.g. Assam TET — 6 months"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Price (₹)</Label>
          <Input
            type="number"
            required
            min={0}
            step={1}
            value={values.price}
            onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))}
            placeholder="e.g. 249"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Duration (days)</Label>
          <Input
            type="number"
            required
            min={1}
            step={1}
            value={values.duration_days}
            onChange={(e) => setValues((v) => ({ ...v, duration_days: e.target.value }))}
            placeholder="e.g. 180"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Categories granted</Label>
        <p className="text-xs text-muted-foreground">
          A subscriber unlocks every exam in the ticked categories for the
          duration.
        </p>
        <div className="mt-1 flex flex-col gap-2">
          {EXAM_CATEGORIES.map((cat) => (
            <Label key={cat} className="flex items-center gap-2 font-normal">
              <Checkbox
                checked={values.category_grants.includes(cat)}
                onCheckedChange={(c) => toggleCategory(cat, c === true)}
              />
              {cat}
            </Label>
          ))}
        </div>
      </div>

      <Label className="flex items-center gap-2 font-normal">
        <Checkbox
          checked={values.is_active}
          onCheckedChange={(c) => setValues((v) => ({ ...v, is_active: c === true }))}
        />
        Active (offered to students)
      </Label>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create plan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/plans")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
