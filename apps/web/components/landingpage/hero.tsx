import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { HeroPreview } from "./hero-preview";
import { TICKER } from "./ticker";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* layered backdrop: grid + violet glow + warm accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,#000_55%,transparent_100%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--border) 50%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--border) 50%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 -z-0 hidden h-80 w-[38rem] rounded-full bg-primary/20 blur-[130px] sm:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-32 -z-0 hidden h-72 w-lg rounded-full bg-brand-accent/15 blur-[130px] sm:block"
      />

      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 pb-28 pt-36 sm:pb-32 lg:gap-20 lg:pt-40">
        {/* copy — sits on top, centered like the preview */}
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          {/*<span
            style={{ "--enter-index": 0 } as React.CSSProperties}
            className="content-enter self-start inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            Assam TET 2026 series is live
          </span>*/}

          <h1
            style={{ "--enter-index": 1 } as React.CSSProperties}
            className="content-enter mt-7 font-heading text-[3rem] leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            Crack every{" "}
            <span className="relative whitespace-nowrap text-primary">
              Assam Govt
              {/*underline svg*/}
              <svg
                aria-hidden
                viewBox="0 0 200 12"
                className="underline-draw absolute -bottom-1 left-0 w-full text-primary/40"
                preserveAspectRatio="none"
              >
                <path
                  pathLength={1}
                  d="M2 8 Q 50 2 100 6 T 198 5"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            exam.
          </h1>

          <p
            style={{ "--enter-index": 2 } as React.CSSProperties}
            className="content-enter mt-6 max-w-md text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Real-pattern mocks, sectional drills, previous-year papers and
            honest analytics.
          </p>

          <div
            style={{ "--enter-index": 3 } as React.CSSProperties}
            className="content-enter mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <Button size="lg" render={<Link href="/signup" />}>
              Start free — no card
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button variant="outline" size="lg" render={<a href="#product" />}>
              <Play data-icon="inline-start" className="fill-current" />
              See what&apos;s inside
            </Button>
          </div>

          <p
            style={{ "--enter-index": 4 } as React.CSSProperties}
            className="content-enter mt-6 text-xs text-muted-foreground"
          >
            First mock in every series is free · {TICKER.length}+ prep tools ·
            Assam-only content
          </p>
        </div>

        {/* product preview — sits below the copy */}
        <div
          style={{ "--enter-index": 5 } as React.CSSProperties}
          className="content-enter relative mx-auto w-full max-w-3xl"
        >
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}
