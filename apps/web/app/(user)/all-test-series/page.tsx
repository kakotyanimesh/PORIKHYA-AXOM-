import {
  getAllTestSeries,
  getIndexedDateLabel,
} from "@/lib/actions/all-test-series.action";
import { groupExamsBySeries } from "@/lib/utils/test-series";
import { TestSeriesGrid } from "@/components/test-series-grid";

export default async function AllTestSeriesPage() {
  const [exams, indexedDate] = await Promise.all([
    getAllTestSeries(),
    getIndexedDateLabel(),
  ]);
  const groups = groupExamsBySeries(exams);
  const totalTests = exams.length;

  return (
    <>
      <header>
        <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">
          Practice,{" "}
          <span className="text-muted-foreground italic">measured.</span>
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Exam-wise mock series built to the real pattern — timed, explained,
          analysed. Every series ships with free attempts, so you commit only
          when it's worth it.
        </p>
      </header>

      <div className="my-6 h-px bg-border" />

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-xl">All series</h2>
          <span className="text-xs tracking-wide text-muted-foreground uppercase">
            {totalTests} Tests
          </span>
        </div>

        {groups.length > 0 ? (
          <TestSeriesGrid groups={groups} />
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            No test series published yet.
          </p>
        )}
      </section>

      <div className="fixed right-4 h-fit top-10 z-30 mx-auto flex w-fit items-center gap-3 rounded-full shadow-[5px_5px_0px_0px_rgba(109,40,217)] bg-card px-4 py-1.5 text-xs text-muted-foreground md:bottom-3 ">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
        <span>{indexedDate}</span>
        <span>{totalTests} Tests Indexed</span>
      </div>
    </>
  );
}
