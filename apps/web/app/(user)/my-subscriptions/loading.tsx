import { Skeleton } from "@repo/ui/components/skeleton";

export default function MySubscriptionsLoading() {
  return (
    <>
      <Skeleton className="h-9 w-64" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>
      <div className="my-6 h-px bg-border" />
      <Skeleton className="h-6 w-40" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-56 w-full rounded-xl" />
        ))}
      </div>
    </>
  );
}
