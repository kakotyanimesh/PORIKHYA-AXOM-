import Link from "next/link";
import { ArrowUpRight, Layers, BarChart3, Timer } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export function SneakPeek() {
  return (
    <section id="product" className="scroll-mt-20 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="text-brand-accent">002</span> · A quick look
              inside
            </p>
            <h2 className="mt-3 max-w-xl font-heading text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
              One quiet workspace.{" "}
              <span className="block text-muted-foreground italic sm:inline">
                Everything you need.
              </span>
            </h2>
          </div>
          <Button variant="outline" size="sm" render={<Link href="/signup" />}>
            Open dashboard
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </div>

        {/* row 1 — dashboard + analysis */}
        <div className="mt-14 grid gap-5 lg:grid-cols-5">
          <DashboardCard />
          <AnalysisCard />
        </div>

        {/* row 2 — exam UI + marks */}
        <div className="mt-5 grid gap-5 lg:grid-cols-5">
          <ExamUiCard />
          <MarksCard />
        </div>
      </div>
    </section>
  );
}

function MockChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
  );
}

function DashboardCard() {
  const mocks = [
    { name: "Assam TET — Paper I", meta: "Mock 01 · Free", free: true },
    { name: "ADRE Grade III", meta: "Mock 04 · Locked", free: false },
    { name: "Assam Police SI", meta: "Mock 02 · Locked", free: false },
  ];
  return (
    <div
      style={{ "--reveal-i": 0 } as React.CSSProperties}
      className="reveal landing-card relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-muted/40 to-background p-7 lg:col-span-3"
    >
      <div className="flex items-center justify-between">
        <MockChip label="Test series" />
        <ArrowUpRight className="size-4 text-muted-foreground/50" />
      </div>
      <h3 className="mt-6 font-heading text-2xl leading-tight tracking-[-0.015em]">
        Mocks that match the real paper.
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Section timing, negative marking and question mix — mapped to the latest
        blueprint. First mock in every series is free.
      </p>
      <div className="mt-6 grid gap-2.5">
        {mocks.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3 transition-colors hover:border-border"
          >
            <div>
              <p className="text-sm font-medium">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.meta}</p>
            </div>
            {m.free ? (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                Free
              </span>
            ) : (
              <Layers className="size-4 text-muted-foreground/50" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalysisCard() {
  return (
    <div
      style={{ "--reveal-i": 1 } as React.CSSProperties}
      className="reveal landing-card relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 p-7 text-neutral-100 lg:col-span-2"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          <BarChart3 className="size-3" /> Analysis
        </span>
        <ArrowUpRight className="size-4 text-neutral-600" />
      </div>
      <h3 className="mt-6 font-heading text-2xl leading-tight tracking-[-0.015em]">
        Every attempt, one honest page.
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-400">
        Score, cutoff and section splits — with the questions that decided your
        rank.
      </p>
      <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-neutral-500">
          <span>APSC mock 07</span>
          <span>82 / 100</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-4xl tracking-[-0.02em]">82%</span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            Cleared cutoff
          </span>
        </div>
        <div className="mt-4 flex h-16 items-end gap-1.5">
          {[70, 92, 55, 80, 88, 40, 95].map((h, i) => (
            <div
              key={i}
              className="bar-rise flex-1 rounded-sm rounded-t-md bg-primary/70"
              style={{ height: `${h}%`, "--bar-i": i } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExamUiCard() {
  const palette = [
    "answered",
    "answered",
    "current",
    "skipped",
    "answered",
    "unseen",
    "answered",
    "skipped",
    "unseen",
    "answered",
    "unseen",
    "unseen",
  ];
  const tone: Record<string, string> = {
    answered: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    current: "bg-primary text-primary-foreground border-primary",
    skipped: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    unseen: "bg-muted text-muted-foreground border-border",
  };
  return (
    <div
      style={{ "--reveal-i": 0 } as React.CSSProperties}
      className="reveal landing-card relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-muted/40 to-background p-7 lg:col-span-2"
    >
      <div className="flex items-center justify-between">
        <MockChip label="Live attempt" />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 font-mono text-xs tabular-nums">
          <Timer className="size-3 text-primary" /> 28:14
        </span>
      </div>
      <h3 className="mt-6 font-heading text-2xl leading-tight tracking-[-0.015em]">
        A test UI that stays out of the way.
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Clean timer, section jumps, question palette — nothing you don&apos;t
        need on exam day.
      </p>
      <div className="mt-6 rounded-2xl border border-border/60 bg-background/80 p-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Section B · Reasoning
        </p>
        <div className="mt-3 grid grid-cols-6 gap-2">
          {palette.map((s, i) => (
            <div
              key={i}
              className={`flex aspect-square items-center justify-center rounded-lg border text-xs font-medium ${tone[s]}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarksCard() {
  const rows = [
    {
      label: "Correct",
      value: "42",
      text: "text-emerald-600",
      bar: "bg-emerald-500",
      w: "72%",
    },
    {
      label: "Incorrect",
      value: "9",
      text: "text-destructive",
      bar: "bg-destructive",
      w: "16%",
    },
    {
      label: "Skipped",
      value: "7",
      text: "text-muted-foreground",
      bar: "bg-muted-foreground",
      w: "12%",
    },
  ];
  return (
    <div
      style={{ "--reveal-i": 1 } as React.CSSProperties}
      className="reveal landing-card relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-muted/40 to-background p-7 lg:col-span-3"
    >
      <div className="flex items-center justify-between">
        <MockChip label="Scorecard" />
        <ArrowUpRight className="size-4 text-muted-foreground/50" />
      </div>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-heading text-2xl leading-tight tracking-[-0.015em]">
            Marks the moment you submit.
          </h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Raw and net score with negative marking applied — computed
            server-side, never guessed.
          </p>
        </div>
        <div className="shrink-0 rounded-2xl border border-border/60 bg-background/80 px-6 py-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net score
          </p>
          <p className="mt-1 font-heading text-4xl tracking-[-0.02em]">
            39<span className="text-lg text-muted-foreground">.25</span>
          </p>
          <p className="text-xs text-muted-foreground">of 50</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3">
        {rows.map((r, i) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="w-20 text-xs text-muted-foreground">{r.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`bar-rise-x h-full rounded-full opacity-70 ${r.bar}`}
                style={{ width: r.w, "--bar-i": i } as React.CSSProperties}
              />
            </div>
            <span className={`w-6 text-right text-sm font-semibold ${r.text}`}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
