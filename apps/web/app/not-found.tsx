import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* landing backdrop: grid + violet glow + warm accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_55%,transparent_100%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--border) 50%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--border) 50%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 -z-0 h-80 w-[38rem] rounded-full bg-primary/20 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-10 -z-0 h-72 w-lg rounded-full bg-brand-accent/15 blur-[130px]"
      />

      <div className="relative flex flex-col items-center">
        <span
          style={{ "--enter-index": 0 } as React.CSSProperties}
          className="content-enter inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500/70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
          </span>
          Page not found
        </span>

        <h1
          style={{ "--enter-index": 1 } as React.CSSProperties}
          className="content-enter mt-7 font-heading text-[5.5rem] font-medium leading-[0.9] tracking-[-0.04em] sm:text-[8rem]"
        >
          404
        </h1>

        <p
          style={{ "--enter-index": 2 } as React.CSSProperties}
          className="content-enter mt-5 max-w-md text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          This page skipped the exam. The link may be broken or the page moved —
          let&apos;s get you back on track.
        </p>

        <div
          style={{ "--enter-index": 3 } as React.CSSProperties}
          className="content-enter mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
        >
          <Button size="lg" render={<Link href="/" />}>
            <Home data-icon="inline-start" />
            Back to home
          </Button>
          <Button variant="outline" size="lg" render={<Link href="/signup" />}>
            Start a free mock
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </main>
  );
}
