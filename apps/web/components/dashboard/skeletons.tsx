import { Card } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

// greeting + score-trend card + the three stat tiles — the per-user block that
// streams in behind Suspense.
export function OverviewSkeleton() {
  return (
    <>
      <div>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-3 h-4 w-full max-w-sm" />
      </div>

      <div className="my-6 h-px bg-border" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-10 w-28" />
              <Skeleton className="mt-2 h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-40 rounded-full" />
          </div>
          <Skeleton className="mt-6 h-40 w-full" />
        </Card>
        <div className="grid grid-rows-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="justify-center gap-2 p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-24" />
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

// rows-only skeleton for a card whose header is already in the static shell.
export function RowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="mt-4 space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}
