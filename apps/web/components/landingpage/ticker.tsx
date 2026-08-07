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
    <div className="overflow-hidden border-y border-border/50 bg-muted/20 `mask-[linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]">
      {/* Track holds two identical copies so the -50% marquee loops seamlessly.
          Trailing margin per item (not flex gap) keeps each copy exactly half
          the track width. Second copy is aria-hidden — it's a visual dupe. */}
      <div className="landing-marquee flex w-max items-center py-6 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
        {[...TICKER, ...TICKER].map((t, i) => (
          <span
            key={i}
            aria-hidden={i >= TICKER.length}
            className="mr-9 inline-flex shrink-0 items-center gap-2 text-primary/60"
          >
            <span className="text-primary/50">+</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
