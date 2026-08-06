"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@repo/ui/components/table";
import { subsectionSchema } from "@/lib/validations/subsection.validation";
import {
  createSubsection,
  updateSubsection,
  deleteSubsection,
} from "@/lib/actions/subsection.action";

export type SubsectionRow = {
  id: string;
  name: string;
  marks_per_question: string | null;
  negative_marking_ratio: string | null;
  order: number;
  questionCount: number;
};

type Draft = {
  name: string;
  marks_per_question: string;
  negative_marking_ratio: string;
  order: string;
};

const EMPTY: Draft = { name: "", marks_per_question: "", negative_marking_ratio: "", order: "0" };

export function SubsectionManager({
  examId,
  subsections,
}: {
  examId: string;
  subsections: SubsectionRow[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof Draft>(key: K, val: string) {
    setDraft((d) => ({ ...d, [key]: val }));
  }

  function startEdit(row: SubsectionRow) {
    setEditingId(row.id);
    setDraft({
      name: row.name,
      marks_per_question: row.marks_per_question ?? "",
      negative_marking_ratio: row.negative_marking_ratio ?? "",
      order: String(row.order),
    });
  }

  function reset() {
    setEditingId(null);
    setDraft(EMPTY);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = subsectionSchema.safeParse({ ...draft, exam_id: examId });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    startTransition(async () => {
      const result = editingId
        ? await updateSubsection({ id: editingId, ...parsed.data })
        : await createSubsection(parsed.data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editingId ? "Subsection updated" : "Subsection added");
      reset();
      router.refresh();
    });
  }

  function handleDelete(row: SubsectionRow) {
    const warn =
      row.questionCount > 0
        ? `Delete "${row.name}"? Its ${row.questionCount} question(s) move to exam-level (not deleted).`
        : `Delete "${row.name}"?`;
    if (!confirm(warn)) return;
    startTransition(async () => {
      const result = await deleteSubsection(row.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Subsection deleted");
      if (editingId === row.id) reset();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {subsections.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-right">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Marks/Q</TableHead>
                <TableHead className="text-right">Neg. ratio</TableHead>
                <TableHead className="text-right">Questions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subsections.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-right text-muted-foreground">{row.order}</TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right">
                    {row.marks_per_question ?? <span className="text-muted-foreground">inherit</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.negative_marking_ratio ?? <span className="text-muted-foreground">inherit</span>}
                  </TableCell>
                  <TableCell className="text-right">{row.questionCount}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(row)} disabled={pending}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(row)} disabled={pending}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border p-4">
        <h2 className="font-medium">{editingId ? "Edit subsection" : "Add subsection"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col gap-2">
            <Label>Name</Label>
            <Input
              required
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. General Knowledge"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Marks per question</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="inherit from exam"
              value={draft.marks_per_question}
              onChange={(e) => set("marks_per_question", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Negative marking ratio</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="inherit from exam"
              value={draft.negative_marking_ratio}
              onChange={(e) => set("negative_marking_ratio", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Order</Label>
            <Input
              type="number"
              min={0}
              step={1}
              value={draft.order}
              onChange={(e) => set("order", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : editingId ? "Save changes" : "Add subsection"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={reset} disabled={pending}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
