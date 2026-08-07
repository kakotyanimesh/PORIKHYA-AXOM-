import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export function Cta() {
  return (
    <section className="px-6 py-28">
      <div className="landing-card relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-primary/20 bg-neutral-950 px-8 py-16 text-center text-neutral-100 sm:px-16">
        {/* glow backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 hidden h-64 w-[40rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px] sm:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 right-0 hidden h-64 w-[30rem] rounded-full bg-brand-accent/15 blur-[120px] sm:block"
        />

        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance font-heading text-4xl leading-[1.04] tracking-[-0.03em] sm:text-5xl">
            Your first mock is free.{" "}
            <span className="text-neutral-400">Start it in under a minute.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-balance text-sm leading-relaxed text-neutral-400">
            No card, no install. Sign up, pick a series and sit your first
            real-pattern test today.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/signup" />}>
              Create free account
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 bg-transparent text-neutral-100 hover:bg-white/10 hover:text-white"
              render={<a href="#pricing" />}
            >
              See pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
