export const TICKER = [
  "Negative marking",
  "Section timing",
  "PYQ tagging",
  "Rank prediction",
  "Weak-spot heatmap",
  "Live leaderboard",
  "Study notes",
  "Assam-focused",
];

export function Ticker() {
  return (
    <div className="border-y border-border/50 bg-muted/20">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-9 gap-y-3 px-6 py-6 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
        {TICKER.map((t) => (
          <span key={t} className="inline-flex items-center gap-2">
            <span className="text-primary/50">+</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
