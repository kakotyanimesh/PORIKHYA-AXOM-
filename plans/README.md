# Animation plans

Self-contained implementation plans from the animation sweep of
`apps/web/app/page.tsx` (landing page). Each is executable by any agent with
zero conversation context. Plans edit source; this dir is planning-only.

## Execution order

| # | Plan | Depends on | Status |
| --- | --- | --- | --- |
| 001 | [Hero first-paint stagger fade-up](001-hero-first-paint-stagger.md) | none | DONE |
| 002 | SneakPeek cards scroll-in reveal (`.reveal`) | none | DONE |
| 003 | FAQ `<details>` smooth height (`.faq-item`) | none | DONE |
| 004 | AnalysisCard bars grow-from-baseline (`.bar-rise`) | none | DONE |

All four Part-1 sweep opportunities implemented directly (002–004 were small
enough to skip a written plan). Motion primitives live in
`packages/ui/src/styles/globals.css`:

- `.content-enter` — hero first-paint stagger (via `--enter-index`)
- `.reveal` — scroll-in fade-rise (via `--reveal-i`), `animation-timeline: view()`
- `.bar-rise` — scroll-in grow-from-baseline (via `--bar-i`)
- `.faq-item::details-content` — native `<details>` height, `interpolate-size`

All are progressive enhancement: `@supports` + `prefers-reduced-motion`
guards mean unsupported browsers / reduced-motion users get the settled
visible state with no regression.
