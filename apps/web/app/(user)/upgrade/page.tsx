import { ShieldCheck, Clock, FileText, LifeBuoy } from "lucide-react";
import { getPlanCatalog } from "@/lib/actions/my-subscriptions.action";
import { SINGLE_TEST_PRICE_INR } from "@/lib/pricing";
import { DashboardReveal, RevealItem } from "@/components/dashboard/reveal";
import { SuperBundleCard } from "@/components/subscriptions/super-bundle-card";
import { PricingTable } from "@/components/subscriptions/pricing-table";
import { PricingFaq } from "@/components/subscriptions/pricing-faq";

const TRUST = [
  { icon: ShieldCheck, label: "Secure payments" },
  { icon: Clock, label: "Cancel anytime" },
  { icon: FileText, label: "Assam-focused content" },
  { icon: LifeBuoy, label: "Priority support" },
];

export default async function UpgradePage() {
  const catalog = await getPlanCatalog();
  const showSuper = catalog.superPlan != null;

  return (
    <DashboardReveal>
      <RevealItem index={0}>
        <header className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Simple, transparent pricing
          </span>
          <h1 className="mt-3 font-heading text-4xl tracking-tight sm:text-5xl">
            Pick a plan.{" "}
            <span className="text-muted-foreground italic">Start preparing.</span>
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            One-time mocks, single-exam passes or the all-in Super bundle. No
            hidden fees.
          </p>
        </header>
      </RevealItem>

      <div className="mt-10">
        <div className={showSuper ? "grid gap-6 lg:grid-cols-5" : "grid gap-6"}>
          <RevealItem index={1} className={showSuper ? "lg:col-span-3" : ""}>
            <PricingTable
              categories={catalog.categories}
              singlePrice={SINGLE_TEST_PRICE_INR}
            />
          </RevealItem>
          {showSuper && (
            <RevealItem index={2} className="lg:col-span-2">
              <SuperBundleCard plan={catalog.superPlan!} />
            </RevealItem>
          )}
        </div>
      </div>

      <RevealItem index={3}>
        <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border p-5 text-sm sm:grid-cols-4">
          {TRUST.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </div>
          ))}
        </div>
      </RevealItem>

      <section className="mx-auto mt-16 max-w-2xl">
        <RevealItem index={4}>
          <h2 className="text-center font-heading text-3xl tracking-tight">
            Questions, answered.
          </h2>
        </RevealItem>
        <RevealItem index={5} className="mt-8 block">
          <PricingFaq />
        </RevealItem>
      </section>
    </DashboardReveal>
  );
}
