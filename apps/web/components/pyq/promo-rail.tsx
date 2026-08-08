import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@repo/ui/components/button";

// Static marketing rail shown alongside the (public, SEO) PYQ pages. Deliberately
// hardcoded copy — no DB read, so the pages stay fully static/cacheable. Prices
// mirror the landing pricing tiers; keep in sync with landingpage/pricing.tsx.
// Visual language borrowed from landingpage/cta.tsx — dark surface + dual glow.
const BENEFITS = [
  "Every mock in the category",
  "PYQs with full solutions",
  "Detailed analytics — percentile & rank",
  "All study topics unlocked",
];

export function PromoRail() {
  return (
    <div className="landing-card relative overflow-hidden rounded-[1.75rem] border border-primary/20 bg-neutral-950 p-6 text-neutral-100">
      {/* glow backdrop — same recipe as the landing CTA, scaled to the rail */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-primary/25 blur-[90px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-12 h-52 w-52 rounded-full bg-brand-accent/15 blur-[90px]"
      />

      <div className="relative">
        <p className="font-dottedFont text-xs font-medium tracking-wide text-primary uppercase">
          Category Pass
        </p>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-heading text-[2.75rem] leading-none tracking-[-0.03em]">
            ₹249
          </span>
          <span className="text-sm text-neutral-400">/ 6 months</span>
        </div>
        <p className="mt-1.5 text-xs text-neutral-500">
          Or ₹499 / year — save 33%
        </p>

        {/* hairline separator instead of a hard divider — keeps the surface calm */}
        <div className="mt-5 h-px bg-gradient-to-r from-white/15 to-transparent" />

        <ul className="mt-5 space-y-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-neutral-200">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              <span className="leading-snug">{b}</span>
            </li>
          ))}
        </ul>

        <Button className="mt-7 w-full" render={<Link href="/signup" />}>
          Create free account
          <ArrowRight data-icon="inline-end" />
        </Button>

        <p className="mt-3 text-center text-xs text-neutral-400">
          Start free — first mock in every series.{" "}
          <Link
            href="/#pricing"
            className="font-medium text-neutral-100 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Compare plans
          </Link>
        </p>
      </div>
    </div>
  );
}
