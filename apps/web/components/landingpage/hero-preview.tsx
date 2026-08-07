import { Timer, Check, TrendingUp } from "lucide-react";
import { CountUp } from "./count-up";

/** Illustrative product mock for the hero — a live-attempt panel with a
 *  floating scorecard. Not a screenshot; composed in markup so it stays crisp
 *  and themed. Numbers are sample data. */
export function HeroPreview() {
  const palette = [
    "answered",
    "answered",
    "current",
    "skipped",
    "answered",
    "unseen",
    "answered",
    "answered",
    "skipped",
    "unseen",
    "answered",
    "unseen",
  ];
  const tone: Record<string, string> = {
    answered: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    current: "bg-primary text-primary-foreground border-primary",
    skipped: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    unseen: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="relative">
      {/* main attempt panel */}
      <div className="landing-card relative z-10 overflow-hidden rounded-3xl border border-border/60 bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="size-2 rounded-full bg-primary" />
            Assam TET — Paper I
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 font-mono text-xs tabular-nums">
            <Timer className="size-3 text-primary" /> 28:14
          </span>
        </div>

        <div className="px-5 py-5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Q 07 · Reasoning
          </p>
          <p className="mt-2 text-sm font-medium leading-snug">
            If FRIEND is coded as HUMANE, how is CANDLE written in that code?
          </p>
          <div className="mt-4 grid gap-2">
            {[
              { k: "A", t: "EDbmch", on: false },
              { k: "B", t: "EDIWQC", on: true },
              { k: "C", t: "DEbfmr", on: false },
            ].map((o) => (
              <div
                key={o.k}
                className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
                  o.on
                    ? "border-primary/40 bg-primary/[0.06] font-medium"
                    : "border-border/60 bg-background"
                }`}
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold ${
                    o.on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {o.on ? <Check className="size-3" /> : o.k}
                </span>
                {o.t}
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-border/50 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Question palette
            </p>
            <div className="mt-2.5 grid grid-cols-6 gap-1.5">
              {palette.map((s, i) => (
                <div
                  key={i}
                  className={`flex aspect-square items-center justify-center rounded-md border text-[11px] font-medium ${tone[s]}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* floating result chip — bottom-right, overlaps the panel */}
      <div className="landing-card absolute -bottom-6 -right-4 z-20 hidden w-52 rounded-2xl border border-border/60 bg-background/90 p-4 backdrop-blur sm:block landing-float">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="size-3 text-emerald-600" /> Result
          </span>
          <span>82 / 100</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <CountUp
            to={82}
            suffix="%"
            className="font-heading text-3xl tracking-[-0.02em]"
          />
          <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">
            Cleared
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Net score</span>
          <span className="font-heading tabular-nums">
            <CountUp to={39.25} decimals={2} /> / 50
          </span>
        </div>
      </div>
    </div>
  );
}
