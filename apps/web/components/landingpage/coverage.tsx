import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const TRACKS = [
  {
    name: "Assam TET",
    tag: "Paper I & II",
    note: "Full-length + sectional mocks, mapped to the latest blueprint.",
    live: true,
  },
  {
    name: "ADRE",
    tag: "Grade III & IV",
    note: "Direct recruitment pattern with negative marking baked in.",
    live: true,
  },
  {
    name: "Assam Police",
    tag: "SI & Constable",
    note: "Reasoning, GK and Assam-specific current affairs.",
    live: true,
  },
  {
    name: "APSC",
    tag: "CCE Prelims",
    note: "Coming next — join free and get notified first.",
    live: false,
  },
];

export function Coverage() {
  return (
    <section className="scroll-mt-20 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="text-brand-accent">003</span> · Exam coverage
            </p>
            <h2 className="mt-3 font-heading text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
              Every track that matters{" "}
              <span className="text-muted-foreground italic">in Assam.</span>
            </h2>
          </div>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRACKS.map((t, i) => (
            <Link
              key={t.name}
              href="/signup"
              style={{ "--reveal-i": i } as React.CSSProperties}
              className="reveal landing-card group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-muted/40 to-background p-6 transition-transform duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <span
                  className={
                    t.live
                      ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600"
                      : "inline-flex items-center gap-1.5 rounded-full bg-brand-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-accent"
                  }
                >
                  {t.live ? "Live" : "Soon"}
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground/40 transition-colors group-hover:text-foreground" />
              </div>
              <h3 className="mt-5 font-heading text-xl tracking-[-0.015em]">
                {t.name}
              </h3>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                {t.tag}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t.note}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
