import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Skeleton } from "@repo/ui/components/skeleton";
import { getCurrentUser } from "@/lib/utils/current-user";
import {
  getActivePlans,
  getMySubscription,
  type MySubscription,
  type PlanOption,
} from "@/lib/actions/my-subscriptions.action";
import { DashboardReveal, RevealItem } from "@/components/dashboard/reveal";
import { LinkPending } from "@/components/link-pending";

const CATEGORY_LABELS: Record<string, string> = {
  ASSAM_TET: "Assam TET",
  ASSAM_POLICE: "Assam Police / SI",
  APSC: "APSC",
  ADRE: "ADRE",
  OTHER: "Other",
};

function categoryLabel(c: string): string {
  return CATEGORY_LABELS[c] ?? c;
}

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

// subtle lift on hover, press nudge on the CTA inside. transform+shadow only
// (GPU), custom ease-out to match the app. motion-reduce drops the movement.
const planCardClass =
  "flex h-full flex-col p-6 transition-[transform,box-shadow] duration-200 " +
  "ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:shadow-secondary " +
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export default function MySubscriptionsPage() {
  return (
    <DashboardReveal>
      <RevealItem index={0}>
        <header>
          <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">
            Your plan,{" "}
            <span className="text-muted-foreground italic">unlocked.</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            One active plan grants every mock in its categories. Buy a single
            exam any time — it stays yours regardless of your plan.
          </p>
        </header>
      </RevealItem>

      <div className="my-6 h-px bg-border" />

      {/* per-user state streams — plans (cached) resolve inside whichever branch renders */}
      <Suspense fallback={<PlanGridSkeleton heading="Choose a plan" />}>
        <SubscriptionState />
      </Suspense>
    </DashboardReveal>
  );
}

async function SubscriptionState() {
  const user = await getCurrentUser();
  const sub = await getMySubscription(user.id);

  if (!sub) return <PlanArea />;
  return <ActiveSubscription sub={sub} />;
}

function ActiveSubscription({ sub }: { sub: MySubscription }) {
  const now = new Date();
  const msLeft = sub.expiresAt.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const expired = msLeft <= 0;

  return (
    <section className="space-y-6">
      <RevealItem index={1}>
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-2xl">{sub.planName}</h2>
                <Badge variant={expired ? "destructive" : "default"}>
                  {expired ? "Expired" : "Active"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {sub.examCount} exam{sub.examCount === 1 ? "" : "s"} unlocked · ₹
                {sub.price} / {sub.durationDays} days
              </p>
            </div>
            <div className="text-right">
              <p className="font-heading text-2xl tabular-nums">
                {expired ? "—" : daysLeft}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {expired ? "renew to continue" : "days left"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {sub.categoryGrants.map((c) => (
              <Badge key={c} variant="secondary">
                {categoryLabel(c)}
              </Badge>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
            <span>Started {dateFmt.format(sub.startedAt)}</span>
            <span>
              {expired ? "Expired" : "Expires"} {dateFmt.format(sub.expiresAt)}
            </span>
          </div>
        </Card>
      </RevealItem>

      {expired ? (
        <Suspense fallback={<PlanGridSkeleton heading="Renew your plan" />}>
          <PlanArea heading="Renew your plan" startIndex={2} />
        </Suspense>
      ) : null}
    </section>
  );
}

async function PlanArea({
  heading = "Choose a plan",
  startIndex = 1,
}: {
  heading?: string;
  startIndex?: number;
}) {
  const plans = await getActivePlans();

  if (plans.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
        No plans available yet.
      </p>
    );
  }

  return (
    <section>
      <RevealItem index={startIndex}>
        <h2 className="font-heading text-xl">{heading}</h2>
      </RevealItem>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p, i) => (
          <RevealItem key={p.id} index={startIndex + 1 + i} className="h-full">
            <PlanCard plan={p} />
          </RevealItem>
        ))}
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: PlanOption }) {
  return (
    <Card className={planCardClass}>
      <div className="flex-1">
        <h3 className="font-heading text-lg">{plan.name}</h3>
        <p className="mt-1">
          <span className="font-heading text-3xl tabular-nums">
            ₹{plan.price}
          </span>
          <span className="text-sm text-muted-foreground">
            {" "}
            / {plan.durationDays} days
          </span>
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          {plan.categoryGrants.map((c) => (
            <li key={c} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              {categoryLabel(c)}
            </li>
          ))}
        </ul>
      </div>
      <Button
        className="mt-6 w-full"
        render={<Link href={`/checkout?plan=${plan.id}`} />}
      >
        Subscribe
        <ArrowRight className="size-4" />
        <LinkPending />
      </Button>
    </Card>
  );
}

function PlanGridSkeleton({ heading }: { heading: string }) {
  return (
    <section>
      <h2 className="font-heading text-xl">{heading}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-56 w-full rounded-xl" />
        ))}
      </div>
    </section>
  );
}
