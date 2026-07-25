import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@repo/ui/components/skeleton";
import { getExamInstructions } from "@/lib/actions/exam-instructions.action";
import { getExamAttemptInit } from "@/lib/actions/lazyquestions.action";
import { ExamAttemptShell } from "@/components/exam-attempt/exam-attempt-shell";

export default function ExamAttemptPage({
  params,
}: {
  params: Promise<{ exam_id: string }>;
}) {
  return (
    <Suspense fallback={<ExamAttemptSkeleton />}>
      <ExamAttemptContent params={params} />
    </Suspense>
  );
}

async function ExamAttemptContent({
  params,
}: {
  params: Promise<{ exam_id: string }>;
}) {
  const { exam_id } = await params;
  const [exam, init] = await Promise.all([
    getExamInstructions({ exam_id }),
    getExamAttemptInit({ exam_id }),
  ]);

  if (!exam) notFound();

  return (
    <ExamAttemptShell
      examId={exam_id}
      examName={exam.name}
      durationMinutes={exam.duration_minutes}
      init={init}
    />
  );
}

function ExamAttemptSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
