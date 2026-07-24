import { FileTextIcon, LockIcon, PlayIcon, ClockIcon } from "lucide-react";
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

export function MockTestTable({
  mockTests,
  className,
}: {
  mockTests: MockTest[];
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
          {mockTests.map((test) => (
            <TableRow key={test.id}>
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
                {test.is_free ? (
                  <Button size="sm" type="button">
                    <PlayIcon />
                    Start
                  </Button>
                ) : (
                  <Button size="sm" type="button" variant="outline">
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
