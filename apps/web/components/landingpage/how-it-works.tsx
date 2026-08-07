"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { MousePointerClick, Timer, Check, Trophy } from "lucide-react";
import { CountUp } from "./count-up";

const STEPS = [
  {
    n: "01",
    icon: MousePointerClick,
    title: "Pick your exam",
    body: "Choose a series — TET, ADRE or Police. First mock in every series is free, no card.",
  },
  {
    n: "02",
    icon: Timer,
    title: "Attempt it timed",
    body: "Real section timing and negative marking. One attempt per test — just like the hall.",
  },
  {
    n: "03",
    icon: Trophy,
    title: "Get scored instantly",
    body: "Net score, percentile and the exact questions that cost you — computed server-side.",
  },
  {
    n: "04",
    icon: Check,
    title: "Fix your weak spots",
    body: "Weak-topic heatmap and study notes point you at what to revise next.",
  },
];
const COUNT = STEPS.length;

/* ---- the four "screens" the pinned device morphs through ---- */

function PickScreen() {
  const rows = [
    { t: "Assam TET — Paper I", on: true },
    { t: "ADRE Grade III", on: false },
    { t: "Assam Police SI", on: false },
  ];
  return (
    <div className="w-full">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Choose a series
      </p>
      <div className="mt-3 grid gap-2.5">
        {rows.map((r) => (
          <div
            key={r.t}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
              r.on
                ? "border-primary/50 bg-primary/[0.06] font-medium"
                : "border-border/60 bg-background"
            }`}
          >
            {r.t}
            <span
              className={`flex size-5 items-center justify-center rounded-md border ${
                r.on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {r.on && <Check className="size-3" />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttemptScreen() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Q 07 · Reasoning
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 font-mono text-xs tabular-nums">
          <Timer className="size-3 text-primary" /> 28:14
        </span>
      </div>
      <p className="mt-3 text-sm font-medium leading-snug">
        FRIEND is coded HUMANE. How is CANDLE written?
      </p>
      <div className="mt-3 grid gap-2.5">
        {[
          { k: "A", t: "EDbmch", on: false },
          { k: "B", t: "EDIWQC", on: true },
          { k: "C", t: "DEbfmr", on: false },
        ].map((o) => (
          <div
            key={o.k}
            className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${
              o.on
                ? "border-primary/40 bg-primary/[0.06] font-medium"
                : "border-border/60 bg-background"
            }`}
          >
            <span
              className={`flex size-5 items-center justify-center rounded-md border text-[11px] font-semibold ${
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
    </div>
  );
}

function ScoreScreen() {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="relative size-28 sm:size-32">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            strokeWidth="10"
            className="stroke-muted"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - 0.82}
            className="stroke-emerald-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <CountUp
            to={82}
            suffix="%"
            className="font-heading text-3xl tracking-[-0.02em]"
          />
          <span className="mt-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
            Cleared
          </span>
        </div>
      </div>
      <div className="mt-4 flex w-full items-center justify-between border-t border-border/50 pt-3.5 text-sm">
        <span className="text-muted-foreground">Net score</span>
        <span className="font-heading tabular-nums">
          <CountUp to={39.25} decimals={2} /> / 50
        </span>
      </div>
    </div>
  );
}

function WeakScreen() {
  const topics = [
    { t: "Reasoning", w: "82%", flag: false },
    { t: "Child Development", w: "64%", flag: false },
    { t: "Maths Pedagogy", w: "46%", flag: true },
    { t: "Assam GK", w: "35%", flag: true },
  ];
  return (
    <div className="w-full">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Weak-topic heatmap
      </p>
      <div className="mt-3 grid gap-2.5">
        {topics.map((t) => (
          <div key={t.t}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{t.t}</span>
              {t.flag && (
                <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600">
                  Revise
                </span>
              )}
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div
                style={{ width: t.w }}
                className={`h-full rounded-full ${
                  t.flag ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SCREENS = [PickScreen, AttemptScreen, ScoreScreen, WeakScreen];

/* One overlapping, pinned layer. Fully visible across the middle of its scroll
   segment (reading time), crossfades at the seams. `text` layers rise/fall;
   `card` layers scale. Blur + motion gated behind reduced-motion. */
function Layer({
  progress,
  index,
  reduce,
  variant,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  reduce: boolean;
  variant: "card" | "text";
  children: React.ReactNode;
}) {
  const seg = 1 / COUNT;
  const start = index * seg;
  const end = start + seg;

  const lowIn = index === 0 ? -0.2 : start - 0.02;
  const lowFull = index === 0 ? -0.1 : start + 0.055;
  const highFull = index === COUNT - 1 ? 1.1 : end - 0.055;
  const highOut = index === COUNT - 1 ? 1.2 : end + 0.02;
  const range = [lowIn, lowFull, highFull, highOut];

  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const scale = useTransform(
    progress,
    range,
    reduce || variant === "text" ? [1, 1, 1, 1] : [0.95, 1, 1, 0.95],
  );
  const y = useTransform(
    progress,
    range,
    reduce || variant === "card" ? [0, 0, 0, 0] : [16, 0, 0, -16],
  );
  return (
    <motion.div
      style={{ opacity, scale, y }}
      className={
        variant === "card"
          ? "absolute inset-0 flex items-center justify-center px-6"
          : "absolute inset-0 flex flex-col justify-center"
      }
    >
      {children}
    </motion.div>
  );
}

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section className="scroll-mt-20 border-t border-border/50 bg-muted/20">
      {/* Scroll track. The stage pins and fills the viewport; only the content
          crossfades. Header stays pinned too so the section never reads as a
          detached full-screen panel. */}
      <div ref={ref} className="relative h-[300vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="mx-auto flex h-full max-w-6xl flex-col px-6 py-10 sm:py-14 lg:py-16">
            <div className="max-w-xl">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                <span className="text-brand-accent">001</span> · How it works
              </p>
              <h2 className="mt-2.5 font-heading text-3xl leading-[1.05] tracking-[-0.025em] sm:text-4xl lg:text-5xl">
                From cold start to clear plan{" "}
                <span className="text-muted-foreground italic">
                  in one attempt.
                </span>
              </h2>
            </div>

            <div className="grid flex-1 items-center gap-6 sm:gap-10 lg:grid-cols-2 lg:gap-16">
              {/* pinned device — crossfades through the four screens */}
              <div className="flex min-h-0 items-center justify-center">
                <div className="landing-card relative aspect-[4/5] w-full max-w-[13.5rem] overflow-hidden rounded-[1.75rem] border border-border/60 bg-background sm:max-w-[17rem] sm:bg-background/80 sm:backdrop-blur lg:max-w-[21rem] lg:rounded-[2rem]">
                  <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-2.5">
                    <span className="size-2 rounded-full bg-primary" />
                    <span className="size-1.5 rounded-full bg-border" />
                    <span className="size-1.5 rounded-full bg-border" />
                  </div>
                  <div className="relative h-[calc(100%-2.75rem)]">
                    {SCREENS.map((Screen, i) => (
                      <Layer
                        key={i}
                        progress={scrollYProgress}
                        index={i}
                        reduce={reduce}
                        variant="card"
                      >
                        <Screen />
                      </Layer>
                    ))}
                  </div>
                </div>
              </div>

              {/* pinned text — each step appears over the last */}
              <div className="relative min-h-[10rem] lg:min-h-[14rem]">
                {STEPS.map((s, i) => (
                  <Layer
                    key={s.n}
                    progress={scrollYProgress}
                    index={i}
                    reduce={reduce}
                    variant="text"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground lg:size-10">
                        <s.icon className="size-4 lg:size-5" />
                      </span>
                      <span className="font-heading text-sm font-semibold text-brand-accent">
                        {s.n}
                      </span>
                    </div>
                    <h3 className="mt-4 font-heading text-2xl tracking-[-0.015em] sm:text-3xl lg:text-4xl">
                      {s.title}
                    </h3>
                    <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {s.body}
                    </p>
                  </Layer>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
