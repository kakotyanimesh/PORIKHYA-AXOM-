import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { getMockTestsBySeriesName } from "@/lib/actions/all-test-series.action";
import { MockTestTable } from "@/components/mock-test-table";

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
    <div className="mx-auto max-w-4xl px-6 py-6 sm:py-8">
      <Link
        href="/all-test-series"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to test series
      </Link>

      <div className="mt-6">
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

      <MockTestTable mockTests={mockTests} className="mt-4" />
    </div>
  );
}
