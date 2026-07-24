import { Skeleton } from "@repo/ui/components/skeleton";

export default function AllTestSeriesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:py-8">
      <header>
        <Skeleton className="h-9 w-72 sm:h-10" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
      </header>

      <div className="my-6 h-px bg-border" />

      <section>
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border p-(--card-spacing)">
              <Skeleton className="aspect-video w-full" />
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-6" />
                </div>
                <Skeleton className="h-5 w-3/4" />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Skeleton className="h-6 w-14 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 border-t pt-4">
                <Skeleton className="h-8 w-10" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
