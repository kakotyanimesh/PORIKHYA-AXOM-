import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Skeleton } from "@repo/ui/components/skeleton";
import { getCurrentUser } from "@/lib/utils/current-user";
import {
  getMySubscriptions,
  getPlanCatalog,
} from "@/lib/actions/my-subscriptions.action";
import { DashboardReveal, RevealItem } from "@/components/dashboard/reveal";
import { ActiveSubscriptionCard } from "@/components/subscriptions/active-subscription-card";
import { SuperBundleCard } from "@/components/subscriptions/super-bundle-card";
import { CategoryPlanCard } from "@/components/subscriptions/category-plan-card";
import { NoSubscription } from "@/components/subscriptions/no-subscription";

export default function MySubscriptionsPage() {
  return (
    <DashboardReveal>
      {/* per-user state streams inside; header is static shell */}
      <Suspense fallback={<PageSkeleton />}>
        <SubscriptionState />
      </Suspense>
    </DashboardReveal>
  );
}

async function SubscriptionState() {
  const user = await getCurrentUser();
  const [subs, catalog] = await Promise.all([
    getMySubscriptions(user.id),
    getPlanCatalog(),
  ]);

  const now = Date.now();
  const activeSubs = subs; // getMySubscriptions already filters is_active
  const hasActive = activeSubs.some((s) => s.expiresAt.getTime() > now);

  // categories the user already holds (non-expired) — hidden from the unlock grid
  const ownedCategories = new Set(
    activeSubs
      .filter((s) => s.expiresAt.getTime() > now)
      .flatMap((s) => s.categoryGrants),
  );
  const ownsSuper =
    catalog.superPlan != null &&
    catalog.superPlan.categoryGrants.every((c) => ownedCategories.has(c));

  const unlockGroups = catalog.categories.filter(
    (g) => !ownedCategories.has(g.category),
  );
  const showSuper = hasActive && catalog.superPlan != null && !ownsSuper;

  // No active plan → a clean empty state, not the plan grid.
  if (!hasActive) {
    const prices = catalog.categories.flatMap((g) =>
      g.durations.map((d) => d.price),
    );
    const fromPrice = prices.length > 0 ? Math.min(...prices) : undefined;
    return (
      <>
        <RevealItem index={0}>
          <header className="text-center">
            <h1 className="font-heading text-4xl tracking-tight sm:text-5xl">
              My subscription
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Your plans and validity windows live here once you unlock one.
            </p>
          </header>
        </RevealItem>
        <RevealItem index={1} className="mx-auto mt-8 block max-w-2xl">
          <NoSubscription fromPrice={fromPrice} />
        </RevealItem>
      </>
    );
  }

  return (
    <>
      <RevealItem index={0}>
        <header className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Your active plan
          </span>
          <h1 className="mt-3 font-heading text-4xl tracking-tight sm:text-5xl">
            My subscription
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Your plan, validity window and the fastest way to add more exams.
          </p>
        </header>
      </RevealItem>

      <div className="mt-8">
        <div className={showSuper ? "grid gap-5 lg:grid-cols-5" : "grid gap-5"}>
          <div className={`space-y-5 ${showSuper ? "lg:col-span-3" : ""}`}>
            {activeSubs.map((sub, i) => (
              <RevealItem key={sub.id} index={1 + i}>
                <ActiveSubscriptionCard sub={sub} />
              </RevealItem>
            ))}
          </div>
          {showSuper && (
            <RevealItem index={1} className="lg:col-span-2">
              <SuperBundleCard plan={catalog.superPlan!} />
            </RevealItem>
          )}
        </div>
      </div>

      {unlockGroups.length > 0 && (
        <section className="mt-12">
          <RevealItem index={2}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Add more
                </p>
                <h2 className="mt-1 font-heading text-2xl">
                  Unlock other exams
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a category plan and start practising immediately.
                </p>
              </div>
              <Link
                href="/upgrade"
                className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Compare all plans
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </div>
          </RevealItem>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unlockGroups.map((group, i) => (
              <RevealItem key={group.category} index={3 + i} className="h-full">
                <CategoryPlanCard group={group} />
              </RevealItem>
            ))}
          </div>
        </section>
      )}

      <RevealItem index={3 + unlockGroups.length}>
        <p className="mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Secure payments · Access starts instantly · Progress never expires
        </p>
      </RevealItem>
    </>
  );
}

function PageSkeleton() {
  return (
    <div>
      <div className="mx-auto max-w-md space-y-3 text-center">
        <Skeleton className="mx-auto h-6 w-32 rounded-full" />
        <Skeleton className="mx-auto h-10 w-64" />
        <Skeleton className="mx-auto h-4 w-80" />
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-5">
        <Skeleton className="h-80 rounded-2xl lg:col-span-3" />
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
