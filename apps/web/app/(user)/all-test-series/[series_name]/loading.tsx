import { Skeleton } from "@repo/ui/components/skeleton";

export default function SeriesMockTestsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-6 sm:py-8">
      <Skeleton className="h-4 w-40" />

      <div className="mt-6">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="mt-3 h-9 w-full max-w-lg sm:h-10" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
      </div>

      <div className="mt-8 flex items-baseline justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border">
        <div className="flex items-center gap-4 border-b px-4 py-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="ml-auto hidden h-3 w-16 sm:block" />
          <Skeleton className="hidden h-3 w-16 sm:block" />
          <Skeleton className="h-3 w-12" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="ml-auto hidden h-4 w-10 sm:block" />
            <Skeleton className="hidden h-4 w-14 sm:block" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
