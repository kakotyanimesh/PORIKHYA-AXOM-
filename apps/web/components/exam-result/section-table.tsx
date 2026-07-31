import { Badge } from "@repo/ui/components/badge";
import { Card } from "@repo/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import type { SectionBreakdownItem } from "@/lib/actions/submit-exam-attempt.action";

export function SectionTable({
  sections,
}: {
  sections: SectionBreakdownItem[];
}) {
  return (
    <Card className="overflow-x-auto p-0 shadow-none">
      <Table>
        <TableHeader className="bg-secondary p-2">
          <TableRow className="hover:bg-transparent">
            <TableHead>Section</TableHead>
            <TableHead>Qns</TableHead>
            <TableHead>Correct</TableHead>
            <TableHead>Wrong</TableHead>
            <TableHead>Skipped</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Cutoff</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((s, i) => (
            <TableRow key={s.section_id ?? "ungrouped"}>
              <TableCell>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium">{s.section_name}</span>
                </span>
              </TableCell>
              <TableCell>{s.total_questions}</TableCell>
              <TableCell className="text-emerald-600">{s.correct}</TableCell>
              <TableCell className="text-destructive">{s.incorrect}</TableCell>
              <TableCell>{s.skipped}</TableCell>
              <TableCell className="font-medium">{s.score}</TableCell>
              <TableCell>{s.cutoff}</TableCell>
              <TableCell>
                <Badge variant={s.cleared ? "default" : "destructive"}>
                  {s.cleared ? "Cleared" : "Missed"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
