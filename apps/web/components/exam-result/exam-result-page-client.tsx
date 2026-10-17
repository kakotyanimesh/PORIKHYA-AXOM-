"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { getExamResultData } from "@/lib/actions/exam-result.action";
import { ExamResultView } from "@/components/exam-result/exam-result-view";
import {
  loadExamResult,
  readExamResultCache,
} from "@/components/exam-result/exam-result-cache";

export function ExamResultPageClient({ examId }: { examId: string }) {
  const [data, setData] = useState(() => readExamResultCache(examId));
  const [loaded, setLoaded] = useState(() => data !== null);
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const cached = readExamResultCache(examId);
    if (cached) {
      setData(cached);
      setLoaded(true);
      return;
    }

    let active = true;
    loadExamResult(examId, () => getExamResultData(examId))
      .then((result) => {
        if (!active) return;
        setData(result);
        setLoaded(true);
      })
      .catch(() => {
        if (active) {
          setLoaded(true);
          setFailed(true);
        }
      });
    return () => {
      active = false;
    };
  }, [examId, retryCount]);

  if (!loaded) return <ResultSkeleton />;
  if (failed) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border p-8 text-center">
        <p className="font-medium">Couldn&apos;t load this result.</p>
        <Button
          className="mt-4"
          onClick={() => {
            setFailed(false);
            setLoaded(false);
            setRetryCount((count) => count + 1);
          }}
        >
          Try again
        </Button>
      </div>
    );
  }
  if (!data) notFound();
  return <ExamResultView data={data} />;
}

function ResultSkeleton() {
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
