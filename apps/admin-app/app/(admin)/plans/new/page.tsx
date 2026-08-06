import { PlanForm } from "@/components/plan-form";

export default function NewPlanPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-heading text-2xl font-medium">New plan</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Plans are per-category and stack — a student can hold several at once.
      </p>
      <PlanForm />
    </div>
  );
}
