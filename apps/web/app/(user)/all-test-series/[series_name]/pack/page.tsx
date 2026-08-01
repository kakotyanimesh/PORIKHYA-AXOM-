import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon } from "lucide-react";
import { getSeriesPackPlans } from "@/lib/actions/all-test-series.action";
import { BuyPlanButton } from "@/components/checkout/buy-plan-button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";

export default async function SeriesPackPage({
  params,
}: {
  params: Promise<{ series_name: string }>;
}) {
  const { series_name } = await params;
  const seriesName = decodeURIComponent(series_name);
  const pack = await getSeriesPackPlans(seriesName);

  if (!pack || pack.plans.length === 0) {
    notFound();
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/all-test-series" />}>
              Test Series
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link href={`/all-test-series/${series_name}`} />}
            >
              {seriesName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">Unlock pack</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="content-enter mt-6">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Series pack · {seriesName}
        </p>
        <h1 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          Unlock every {seriesName} test.
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          One payment unlocks all mock tests in this series for the plan period —
          far cheaper than buying tests one by one.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {pack.plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col rounded-2xl border p-6"
          >
            <div className="font-heading text-lg">{plan.name}</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-semibold">₹{plan.price}</span>
              <span className="text-sm text-muted-foreground">
                / {plan.durationDays} days
              </span>
            </div>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-primary" />
                Every test in {seriesName}
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-primary" />
                Valid for {plan.durationDays} days
              </li>
            </ul>
            <div className="mt-6">
              <BuyPlanButton planId={plan.id}>Buy for ₹{plan.price}</BuyPlanButton>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
