import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllSeriesNames,
  getMockTestsBySeriesName,
} from "@/lib/actions/all-test-series.action";
import { MockTestTable } from "@/components/mock-test-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";

// prerender one static page per series at build time so back/forward
// navigation is instant. Series added later render on-demand, then cache.
export async function generateStaticParams() {
  const seriesNames = await getAllSeriesNames();
  return seriesNames.map((series_name) => ({ series_name }));
}

export default async function SeriesMockTestsPage({
  params,
}: {
  params: Promise<{ series_name: string }>;
}) {
  const { series_name } = await params;
  const seriesName = decodeURIComponent(series_name);
  const mockTests = await getMockTestsBySeriesName({ series_name: seriesName });

  if (mockTests.length === 0) {
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
            <BreadcrumbPage className="font-medium">{seriesName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="content-enter mt-6">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Mock Tests · {seriesName}
        </p>
        <h1 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          {seriesName}. <span className="text-muted-foreground italic">Real pattern, real timer.</span>
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Full-length papers built to match the actual {seriesName} pattern. The first free test in
          this series is open right away.
        </p>
      </div>

      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="font-heading text-xl">All mock tests</h2>
        <span className="text-xs tracking-wide text-muted-foreground uppercase">
          {mockTests.length} tests
        </span>
      </div>

      <MockTestTable mockTests={mockTests} seriesName={series_name} className="mt-4" />
    </>
  );
}
