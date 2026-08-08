import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { SINGLE_TEST_PRICE_INR } from "@/lib/pricing";

export function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "₹0",
      unit: "forever",
      blurb: "Enough to feel the real thing.",
      features: [
        "First mock in every series",
        "All previous-year papers",
        "One study topic per subject",
        "Basic score on submit",
      ],
      cta: "Start free",
      href: "/signup",
      highlight: false,
      note: undefined as string | undefined,
    },
    {
      name: "Category Pass",
      price: "₹249",
      unit: "/ 6 months",
      blurb: "Go deep on one exam — TET, ADRE or Police.",
      features: [
        "Every mock in the category",
        "Detailed solutions + analytics",
        "Percentile, rank & weak-spots",
        "PYQs with solutions",
        "All study topics",
      ],
      cta: "Upgrade now",
      href: "/signup",
      highlight: true,
      note: "Or ₹499 / year — save 33%",
    },
    {
      name: "Super",
      price: "₹1299",
      unit: "/ year",
      blurb: "All three categories, one price.",
      features: [
        "Everything in Category Pass",
        "TET + ADRE + Police",
        "All-Assam leaderboard",
        "Priority support",
      ],
      cta: "Go Super",
      href: "/signup",
      highlight: false,
      note: undefined,
    },
  ];

  return (
    <section id="pricing" className="scroll-mt-20 border-t border-border/50 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-left">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-brand-accent">004</span> · Pricing
          </p>
          <h2 className="mt-3 font-heading text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
            Simple plans.{" "}
            <span className="text-muted-foreground italic">
              One honest price.
            </span>
          </h2>
          <p className=" mt-4 max-w-md text-balance text-sm leading-relaxed text-muted-foreground">
            Try free first. Or unlock a single exam for just ₹
            {SINGLE_TEST_PRICE_INR}. Upgrade only when you&apos;re ready.
          </p>
        </div>

        <div className="mt-19 grid items-start gap-5 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <div
              key={t.name}
              style={{ "--reveal-i": i } as React.CSSProperties}
              className={
                t.highlight
                  ? "reveal landing-card relative overflow-hidden rounded-3xl border-2 border-primary bg-gradient-to-b from-primary/[0.06] to-background p-8 transition-transform duration-200 ease-out lg:-mt-4 lg:pb-10 [@media(hover:hover)]:hover:-translate-y-1"
                  : "reveal landing-card relative overflow-hidden rounded-3xl border border-border/60 bg-background p-8 transition-transform duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-1"
              }
            >
              {t.highlight && (
                <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                  <Sparkles className="size-3" /> Most popular
                </span>
              )}
              <p className="text-sm font-medium text-muted-foreground">
                {t.name}
              </p>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-heading text-5xl tracking-[-0.03em]">
                  {t.price}
                </span>
                <span className="text-sm text-muted-foreground">{t.unit}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>

              <Button
                variant={t.highlight ? "default" : "outline"}
                size="lg"
                className="mt-6 w-full"
                render={<Link href={t.href} />}
              >
                {t.cta}
                <ArrowRight data-icon="inline-end" />
              </Button>
              {t.note && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {t.note}
                </p>
              )}

              <ul className="mt-7 space-y-3 border-t border-border/50 pt-6 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Plans stack — hold TET and Police at once. Cancel anytime, no card
          required for the free tier.
        </p>
      </div>
    </section>
  );
}
