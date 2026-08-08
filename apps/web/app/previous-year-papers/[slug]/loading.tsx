import { Skeleton } from "@repo/ui/components/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-4 w-56" />
      <Skeleton className="mt-6 h-3 w-28" />
      <Skeleton className="mt-3 h-10 w-80 max-w-full" />
      <Skeleton className="mt-3 h-4 w-52" />

      <div className="my-8 h-px bg-border" />

      <div className="space-y-8">
        {Array.from({ length: 4 }).map((_, q) => (
          <div key={q} className="flex gap-3">
            <Skeleton className="h-4 w-4 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
