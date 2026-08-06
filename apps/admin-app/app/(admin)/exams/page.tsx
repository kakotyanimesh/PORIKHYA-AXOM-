import Link from "next/link";
import { prisma } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@repo/ui/components/table";

export default async function ExamsPage() {
  const exams = await prisma.exam.findMany({
    orderBy: [{ series_name: "asc" }, { created_at: "desc" }],
    select: {
      id: true,
      name: true,
      series_name: true,
      category: true,
      duration_minutes: true,
      is_free: true,
      is_active: true,
      _count: { select: { questions: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-medium">Exams</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {exams.length} exam{exams.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button render={<Link href="/exams/new" />}>New exam</Button>
      </div>

      {exams.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No exams yet. Create the first one.
        </p>
      ) : (
        <div className="mt-6 rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Series</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Questions</TableHead>
                <TableHead className="text-right">Mins</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.name}</TableCell>
                  <TableCell className="text-muted-foreground">{exam.series_name}</TableCell>
                  <TableCell>{exam.category}</TableCell>
                  <TableCell className="text-right">{exam._count.questions}</TableCell>
                  <TableCell className="text-right">{exam.duration_minutes}</TableCell>
                  <TableCell className="space-x-1">
                    {exam.is_free && <Badge variant="secondary">Free</Badge>}
                    {!exam.is_active && <Badge variant="outline">Inactive</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/exams/${exam.id}/edit`} />}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
