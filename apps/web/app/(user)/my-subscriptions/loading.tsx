import { Skeleton } from "@repo/ui/components/skeleton";

export default function MySubscriptionsLoading() {
  return (
    <div className="p-4">
      <Skeleton className="h-7 w-48" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full max-w-sm" />
        <Skeleton className="h-4 w-full max-w-xs" />
      </div>
    </div>
  );
}
