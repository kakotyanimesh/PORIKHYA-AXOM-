import { ExamResultPageClient } from "@/components/exam-result/exam-result-page-client";

export default async function ExamResultPage({
  params,
}: {
  params: Promise<{ exam_id: string }>;
}) {
  const { exam_id } = await params;
  return <ExamResultPageClient key={exam_id} examId={exam_id} />;
}
