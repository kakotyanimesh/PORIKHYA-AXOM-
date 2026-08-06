import { PlanForm } from "@/components/plan-form";
import { AdminBreadcrumb } from "@/components/admin-breadcrumb";

export default function NewPlanPage() {
  return (
    <div className="mx-auto max-w-xl">
      <AdminBreadcrumb
        items={[{ label: "Plans", href: "/plans" }, { label: "New plan" }]}
      />
      <h1 className="font-heading text-2xl font-medium">New plan</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Plans are per-category and stack — a student can hold several at once.
      </p>
      <PlanForm />
    </div>
  );
}
