import Link from "next/link";
import {
  ClipboardListIcon,
  CircleHelpIcon,
  CreditCardIcon,
  PencilLineIcon,
} from "lucide-react";
import { prisma } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";

export default async function AdminHome() {
  const [exams, activeExams, questions, activePlans] = await Promise.all([
    prisma.exam.count(),
    prisma.exam.count({ where: { is_active: true } }),
    prisma.question.count(),
    prisma.plan.count({ where: { is_active: true } }),
  ]);

  const tiles = [
    {
      label: "Exams",
      value: exams,
      sub: `${activeExams} active`,
      icon: ClipboardListIcon,
      href: "/exams",
    },
    {
      label: "Questions",
      value: questions,
      sub: "across all exams",
      icon: CircleHelpIcon,
      href: "/exams",
    },
    {
      label: "Active plans",
      value: activePlans,
      sub: "subscription bundles",
      icon: CreditCardIcon,
      href: "/plans",
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-medium">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Content at a glance. Jump into managing exams, questions, and plans.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="group">
            <Card className="transition-colors group-hover:border-foreground/20">
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <t.icon className="size-4" />
                  {t.label}
                </CardDescription>
                <CardTitle className="text-3xl tabular-nums">{t.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{t.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-medium text-muted-foreground">Quick actions</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button render={<Link href="/exams/new" />}>
          <ClipboardListIcon /> New exam
        </Button>
        <Button variant="outline" render={<Link href="/plans/new" />}>
          <CreditCardIcon /> New plan
        </Button>
        <Button variant="outline" render={<Link href="/import" />}>
          <PencilLineIcon /> Import from JSON
        </Button>
      </div>
    </div>
  );
}
