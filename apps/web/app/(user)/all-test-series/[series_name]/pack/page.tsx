import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSeriesPackPlans } from "@/lib/actions/all-test-series.action";
import { PackPlanCard } from "@/components/subscriptions/pack-plan-card";
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

  // longest-duration plan is the best value — highlight it and show how much
  // per-day it saves against the shortest.
  const longest = pack.plans.reduce((a, b) =>
    b.durationDays > a.durationDays ? b : a,
  );
  const shortest = pack.plans.reduce((a, b) =>
    b.durationDays < a.durationDays ? b : a,
  );
  const savingsPct =
    shortest.durationDays > 0 && longest.durationDays > 0
      ? Math.round(
          (1 -
            longest.price /
              longest.durationDays /
              (shortest.price / shortest.durationDays)) *
            100,
        )
      : 0;

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
        {pack.plans.map((plan, index) => (
          <div
            key={plan.id}
            className="content-enter"
            style={{ "--enter-index": index } as CSSProperties}
          >
            <PackPlanCard
              plan={plan}
              seriesName={seriesName}
              highlighted={plan.id === longest.id && pack.plans.length > 1}
              savingsPct={savingsPct}
            />
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Secure payments · Access starts instantly · Progress never expires
      </p>
    </>
  );
}
