import { Skeleton } from "@repo/ui/components/skeleton";

export default function PreviousYearPapersLoading() {
  return (
    <>
      <Skeleton className="h-7 w-56" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full max-w-sm" />
        <Skeleton className="h-4 w-full max-w-xs" />
      </div>
    </>
  );
}
