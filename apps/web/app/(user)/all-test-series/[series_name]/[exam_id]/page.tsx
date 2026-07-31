import Link from "next/link";
import { notFound } from "next/navigation";
import { FileTextIcon, ClockIcon, AwardIcon, BanIcon } from "lucide-react";
import { getExamInstructions } from "@/lib/actions/exam-instructions.action";
import { getExamAttemptStatus } from "@/lib/actions/start-exam-attempt.action";
import { StartTestGate } from "@/components/start-test-gate";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";

const GENERAL_RULES = [
  "The clock runs continuously once you begin. The test auto-submits when time expires.",
  "Do not refresh, switch tabs, or close the window during the exam.",
  "Each question has exactly one correct option unless mentioned otherwise.",
  "You can mark a question for review and return to it later using the palette.",
  "Use only the on-screen navigator — the browser's back button is disabled.",
  "This is a one-time attempt — once started, it cannot be paused or retaken.",
];

const PALETTE_LEGEND = [
  { label: "Answered", dotClassName: "bg-emerald-500" },
  { label: "Not answered", dotClassName: "bg-rose-500" },
  { label: "Marked for review", dotClassName: "bg-amber-500" },
  { label: "Not visited", dotClassName: "bg-muted-foreground/30" },
];

export default async function ExamInstructionsPage({
  params,
}: {
  params: Promise<{ series_name: string; exam_id: string }>;
}) {
  const { series_name, exam_id } = await params;
  const seriesName = decodeURIComponent(series_name);
  const [exam, attemptStatus] = await Promise.all([
    getExamInstructions({ exam_id }),
    getExamAttemptStatus({ exam_id }),
  ]);

  if (!exam) {
    notFound();
  }

  const negativeMarks = Number(exam.negative_marking);
  const wrongAnswerMarks = negativeMarks > 0 ? `-${negativeMarks}` : 0;

  const stats = [
    { icon: FileTextIcon, label: "Questions", value: exam.total_questions },
    {
      icon: ClockIcon,
      label: "Duration",
      value: `${exam.duration_minutes} min`,
    },
    { icon: AwardIcon, label: "Max marks", value: exam.total_questions },
    // {
    //   icon: BanIcon,
    //   label: "Negative",
    //   value: negativeMarks > 0 ? `-${negativeMarks}` : "None",
    // },
  ];

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/all-test-series" />}>
              Test Series
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link href={`/all-test-series/${series_name}`} />}
            >
              {seriesName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{exam.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Instructions
        </p>
        <h1 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          Read once.{" "}
          <span className="text-muted-foreground italic">Then begin.</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {exam.name}. Full-length, timed, and analytics-graded.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-b pb-6 text-sm">
        {stats.map(({ icon: Icon, label, value }) => (
          <span key={label} className="inline-flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-[1fr_320px]">
        <section>
          <h2 className="font-heading text-lg">General rules</h2>
          <ol className="mt-4 space-y-4">
            {GENERAL_RULES.map((rule, index) => (
              <li key={rule} className="flex gap-3 text-sm">
                <span className="text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-col gap-4">
          <section className="rounded-2xl border p-6">
            <h2 className="font-heading text-lg">Marking scheme</h2>
            <dl className="mt-4 divide-y">
              <div className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-muted-foreground">Correct answer</dt>
                <dd className="font-medium">+1</dd>
              </div>
              <div className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-muted-foreground">Wrong answer</dt>
                <dd className="font-medium">{wrongAnswerMarks}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-muted-foreground">Unattempted</dt>
                <dd className="font-medium">0</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border p-6">
            <h2 className="font-heading text-lg">Palette legend</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {PALETTE_LEGEND.map(({ label, dotClassName }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 text-sm"
                >
                  <span className={`size-2.5 rounded-full ${dotClassName}`} />
                  {label}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-4">
        {attemptStatus.attempted ? (
          <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
            {attemptStatus.completed
              ? "You've already completed this exam. Each exam can only be attempted once."
              : "Your previous attempt on this exam wasn't completed. Since attempts are locked at start, it can't be retaken."}
          </div>
        ) : (
          <StartTestGate examId={exam_id} />
        )}
      </div>
    </>
  );
}
