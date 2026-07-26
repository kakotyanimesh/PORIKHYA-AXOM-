import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { getCurrentUser } from "@/lib/utils/current-user";

export default async function ExamResultPage({
  params,
}: {
  params: Promise<{ exam_id: string }>;
}) {
  const { exam_id } = await params;
  const user = await getCurrentUser();

  const [attempt, exam] = await Promise.all([
    prisma.examAttempt.findUnique({
      where: { user_id_exam_id: { user_id: user.id, exam_id } },
      select: {
        completed_at: true,
        raw_score: true,
        final_score: true,
        percentage: true,
        correct_answers: true,
        incorrect_answers: true,
        skipped_questions: true,
      },
    }),
    prisma.exam.findUnique({
      where: { id: exam_id },
      select: { name: true, pass_score_percent: true, total_questions: true },
    }),
  ]);

  if (!attempt || !attempt.completed_at || !exam) notFound();

  const percentage = attempt.percentage!.toNumber();
  const passed = percentage >= exam.pass_score_percent.toNumber();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {exam.name}
            <Badge variant={passed ? "default" : "destructive"}>
              {passed ? "Passed" : "Not passed"}
            </Badge>
          </CardTitle>
          <CardDescription>{percentage.toFixed(2)}%</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Stat label="Final score" value={attempt.final_score!.toString()} />
          <Stat label="Raw score" value={attempt.raw_score!.toString()} />
          <Stat label="Correct" value={String(attempt.correct_answers)} />
          <Stat label="Incorrect" value={String(attempt.incorrect_answers)} />
          <Stat label="Skipped" value={String(attempt.skipped_questions)} />
          <Stat label="Total questions" value={String(exam.total_questions)} />
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
