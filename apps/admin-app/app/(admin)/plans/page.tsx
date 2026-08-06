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

export default async function PlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      name: true,
      price: true,
      duration_days: true,
      category_grants: true,
      is_active: true,
      _count: { select: { subscriptions: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-medium">Plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {plans.length} plan{plans.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button render={<Link href="/plans/new" />}>New plan</Button>
      </div>

      {plans.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No plans yet. Create the first one.
        </p>
      ) : (
        <div className="mt-6 rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Days</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead className="text-right">Subs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="text-right">₹{plan.price.toString()}</TableCell>
                  <TableCell className="text-right">{plan.duration_days}</TableCell>
                  <TableCell className="space-x-1">
                    {plan.category_grants.map((c) => (
                      <Badge key={c} variant="secondary">{c}</Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-right">{plan._count.subscriptions}</TableCell>
                  <TableCell>
                    {plan.is_active ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" render={<Link href={`/plans/${plan.id}/edit`} />}>
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
