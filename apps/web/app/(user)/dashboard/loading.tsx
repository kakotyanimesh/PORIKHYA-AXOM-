import { Card } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  OverviewSkeleton,
  RowsSkeleton,
} from "@/components/dashboard/skeletons";

export default function DashboardLoading() {
  return (
    <>
      <OverviewSkeleton />
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <Skeleton className="h-6 w-28" />
          <RowsSkeleton rows={3} />
        </Card>
        <Card className="p-6 lg:col-span-2">
          <Skeleton className="h-6 w-36" />
          <RowsSkeleton rows={4} />
        </Card>
      </div>
    </>
  );
}
