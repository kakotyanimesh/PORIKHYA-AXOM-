import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { LinkPending } from "@/components/link-pending";
import type { MySubscription } from "@/lib/actions/my-subscriptions.action";
import { catMeta } from "./category-meta";
import { PlanProgress } from "./plan-progress";

const DAY = 1000 * 60 * 60 * 24;

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background/60 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}

// One active plan the user holds — validity window, what it unlocks, and the
// fastest way back into practice. Presentational: hand it a MySubscription.
export function ActiveSubscriptionCard({ sub }: { sub: MySubscription }) {
  const primary = sub.categoryGrants[0] ?? "OTHER";
  const meta = catMeta(primary);

  const now = Date.now();
  const msLeft = sub.expiresAt.getTime() - now;
  const expired = msLeft <= 0;
  const daysLeft = Math.max(0, Math.ceil(msLeft / DAY));

  const total = sub.durationDays;
  const elapsed = Math.min(
    total,
    Math.max(0, Math.round((now - sub.startedAt.getTime()) / DAY)),
  );
  const pct = total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 0;

  return (
    <Card className="flex h-full flex-col p-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted font-heading text-sm font-semibold">
          {meta.monogram}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-2xl">{sub.planName}</h2>
            <Badge variant={expired ? "destructive" : "default"}>
              {expired ? "Expired" : "Active"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {sub.durationDays}-day plan · ₹{sub.price} paid
          </p>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        {meta.features.map((f) => (
          <li key={f} className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat label="Start date" value={dateFmt.format(sub.startedAt)} />
        <Stat label="Expires on" value={dateFmt.format(sub.expiresAt)} />
        <Stat
          label="Days left"
          value={expired ? "—" : `${daysLeft} days`}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button render={<Link href="/all-test-series" />}>
          Start practising
          <ArrowRight className="size-4" />
          <LinkPending />
        </Button>
        <Button variant="outline" render={<Link href="/upgrade" />}>
          Renew or upgrade
          <LinkPending />
        </Button>
      </div>

      <div className="mt-auto pt-6">
        <PlanProgress pct={pct} dayNumber={elapsed} totalDays={total} />
      </div>
    </Card>
  );
}
