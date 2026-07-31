import { Skeleton } from "@repo/ui/components/skeleton";

export default function ExamInstructionsLoading() {
  return (
    <>
      <Skeleton className="h-4 w-64" />

      <div className="mt-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-9 w-full max-w-md sm:h-10" />
        <Skeleton className="mt-3 h-4 w-full max-w-sm" />
      </div>

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-b pb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-24" />
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>

      <Skeleton className="mt-8 h-24 rounded-2xl" />
    </>
  );
}



/**
 * 
 */