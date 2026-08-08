import { Skeleton } from "@repo/ui/components/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-3 h-10 w-72 max-w-full" />
      <Skeleton className="mt-3 h-4 w-full max-w-md" />

      <div className="mt-10 space-y-10">
        {Array.from({ length: 2 }).map((_, s) => (
          <div key={s}>
            <Skeleton className="h-5 w-40" />
            <div className="mt-4 space-y-px rounded-2xl border p-2">
              {Array.from({ length: 4 }).map((_, r) => (
                <Skeleton key={r} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
