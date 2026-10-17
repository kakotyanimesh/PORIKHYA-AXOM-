import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ExamResultPageClient } from "@/components/exam-result/exam-result-page-client";

export default function ExamResultPage({
  params,
}: {
  params: Promise<{ exam_id: string }>;
}) {
  return (
    <Suspense fallback={<ResultRouteSkeleton />}>
      <ExamResult params={params} />
    </Suspense>
  );
}

async function ExamResult({
  params,
}: {
  params: Promise<{ exam_id: string }>;
}) {
  const { exam_id } = await params;
  return <ExamResultPageClient key={exam_id} examId={exam_id} />;
}

function ResultRouteSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
