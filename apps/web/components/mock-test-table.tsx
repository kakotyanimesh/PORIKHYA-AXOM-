import type { CSSProperties } from "react";
import Link from "next/link";
import { FileTextIcon, LockIcon, ClockIcon, ChartColumnIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import type { MockTest } from "@/lib/actions/all-test-series.action";
import { LinkPending } from "./link-pending";

export function MockTestTable({
  mockTests,
  seriesName,
  completedExamIds,
  className,
}: {
  mockTests: MockTest[];
  seriesName: string;
  completedExamIds: Set<string>;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Test</TableHead>
            <TableHead className="hidden sm:table-cell">Questions</TableHead>
            <TableHead className="hidden sm:table-cell">Duration</TableHead>
            <TableHead className="text-end">Access</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTests.map((test, index) => (
            <TableRow
              key={test.id}
              className="content-enter"
              style={{ "--enter-index": Math.min(index, 8) } as CSSProperties}
            >
              <TableCell className="whitespace-normal">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileTextIcon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">{test.name}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground sm:hidden">
                      <span>{test.total_questions} Qs</span>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon className="size-3" />
                        {test.duration_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {test.total_questions} Qs
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {test.duration_minutes} min
              </TableCell>
              <TableCell className="text-end">
                {completedExamIds.has(test.id) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-22"
                    render={<Link href={`/exams/${test.id}/result`} />}
                  >
                    <ChartColumnIcon />
                    Analyse
                  </Button>
                ) : test.is_free ? (
                  <Button
                    size="sm"
                    className={"w-22"}
                    render={
                      <Link
                        href={`/all-test-series/${seriesName}/${test.id}`}
                      />
                    }
                  >
                    <LinkPending />
                    Start
                  </Button>
                ) : (
                  <Button size="sm" type="button" variant="secondary">
                    <LockIcon />
                    Unlock
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
