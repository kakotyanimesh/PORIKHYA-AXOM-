import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { PlanForm, type PlanFormValues } from "@/components/plan-form";
import { DeletePlanButton } from "@/components/delete-plan-button";
import { AdminBreadcrumb } from "@/components/admin-breadcrumb";
import { EXAM_CATEGORIES } from "@/lib/validations/exam.validation";

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) notFound();

  const initial: PlanFormValues = {
    id: plan.id,
    name: plan.name,
    price: plan.price.toString(),
    duration_days: String(plan.duration_days),
    category_grants: plan.category_grants.filter((c) => EXAM_CATEGORIES.includes(c)),
    is_active: plan.is_active,
  };

  return (
    <div className="mx-auto max-w-xl">
      <AdminBreadcrumb
        items={[{ label: "Plans", href: "/plans" }, { label: plan.name }]}
      />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium">Edit plan</h1>
        <DeletePlanButton id={plan.id} name={plan.name} />
      </div>
      <PlanForm initial={initial} />
    </div>
  );
}
