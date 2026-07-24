import type { TestSeriesExam } from "@/lib/actions/all-test-series.action";

export type TestSeriesGroup = {
  seriesName: string;
  subjectLabel: string;
  totalTests: number;
  tags: string[];
  extraTagCount: number;
};

const MAX_TAGS = 2;

export function groupExamsBySeries(exams: TestSeriesExam[]): TestSeriesGroup[] {
  const bySeries = new Map<string, TestSeriesExam[]>();

  for (const exam of exams) {
    const group = bySeries.get(exam.series_name);
    if (group) {
      group.push(exam);
    } else {
      bySeries.set(exam.series_name, [exam]);
    }
  }

  return Array.from(bySeries.entries()).map(([seriesName, seriesExams]) => {
    const uniqueNames = Array.from(new Set(seriesExams.map((exam) => exam.name)));
    return {
      seriesName,
      subjectLabel: seriesExams[0]!.subject,
      totalTests: seriesExams.length,
      tags: uniqueNames.slice(0, MAX_TAGS),
      extraTagCount: Math.max(0, uniqueNames.length - MAX_TAGS),
    };
  });
}
