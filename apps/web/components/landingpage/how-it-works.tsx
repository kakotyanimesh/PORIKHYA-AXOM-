import { MousePointerClick, Timer, BarChart3, TrendingUp } from "lucide-react";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Pick your exam",
    body: "Choose a series — TET, ADRE or Police. First mock in every series is free, no card.",
  },
  {
    icon: Timer,
    title: "Attempt it timed",
    body: "Real section timing and negative marking. One attempt per test — just like the hall.",
  },
  {
    icon: BarChart3,
    title: "Get scored instantly",
    body: "Net score, percentile and the exact questions that cost you — computed server-side.",
  },
  {
    icon: TrendingUp,
    title: "Fix your weak spots",
    body: "Weak-topic heatmap and study notes point you at what to revise next.",
  },
];

export function HowItWorks() {
  return (
    <section className="scroll-mt-20 border-t border-border/50 bg-muted/20 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-brand-accent">001</span> · How it works
          </p>
          <h2 className="mt-3 font-heading text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
            From cold start to clear plan{" "}
            <span className="text-muted-foreground italic">in one attempt.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              style={{ "--reveal-i": i } as React.CSSProperties}
              className="reveal landing-card relative overflow-hidden rounded-3xl border border-border/60 bg-background p-6"
            >
              <span className="font-heading text-sm font-semibold text-brand-accent">
                0{i + 1}
              </span>
              <div className="mt-4 flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 text-primary">
                <s.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg tracking-[-0.01em]">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
