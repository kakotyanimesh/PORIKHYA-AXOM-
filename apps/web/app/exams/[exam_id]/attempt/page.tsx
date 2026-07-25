import { notFound } from "next/navigation";
import { getExamInstructions } from "@/lib/actions/exam-instructions.action";
import { getExamAttemptInit } from "@/lib/actions/lazyquestions.action";
import { ExamAttemptShell } from "@/components/exam-attempt/exam-attempt-shell";

export default async function ExamAttemptPage({
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
