# 001 — Hero first-paint stagger fade-up

**Status:** DONE (implemented on top of `0457632`)
**Base commit:** `0457632`
**Scope:** 1 file, CSS-class + inline-var only. No new deps. No JS. Server-component safe.

## Goal

The landing hero currently hard-cuts in — badge, headline, subhead, CTA row, and
trust line all paint at once on first load. Add a staggered fade-up so the hero
feels intentional on arrival. Purpose: prevent the jarring instant-paint / small
delight moment on a rare (first-visit) surface. Budget: 220ms per element,
40ms stagger between them (last element settles ~380ms). Inside marketing budget.

This reuses the repo's existing entrance primitive — **do not invent a new
keyframe, easing, or duration.**

## The primitive to reuse

`packages/ui/src/styles/globals.css:183–195` already defines a pure-CSS,
JS-free entrance class using `@starting-style`:

```css
.content-enter {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 220ms cubic-bezier(0.23, 1, 0.32, 1),
    transform 220ms cubic-bezier(0.23, 1, 0.32, 1);
  transition-delay: calc(var(--enter-index, 0) * 40ms);

  @starting-style {
    opacity: 0;
    transform: translateY(6px);
  }
}
```

Reduced-motion is **already handled** at `globals.css:207–214` (drops the
transform and zeroes the delay). No extra reduced-motion work needed in this plan.

Mechanism: `@starting-style` animates an element from the starting style the
first time it is rendered into the DOM. On a fresh page load or a client-side
nav to `/`, every hero child is newly mounted, so each animates once. Per-element
timing is driven by the `--enter-index` CSS custom property (0, 1, 2, …), which
scales the `transition-delay`.

## Exact change

**File:** `apps/web/app/page.tsx`
**Function:** `Hero()` (lines 110–164)

Apply `content-enter` to the five direct children of the hero content column and
set an incrementing `--enter-index` on each. The `style` cast keeps TypeScript
happy for the custom property.

### Current code (`apps/web/app/page.tsx:128–161`)

```tsx
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-40 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          Assam TET 2026 series is live
        </span>

        <h1 className="mt-7 font-heading text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Ace your{" "}
          <span className="text-primary italic underline decoration-primary/30 decoration-2 underline-offset-8">
            Assam
          </span>{" "}
          competitive exams
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Full-length mocks, sectional drills, previous-year papers and honest
          analytics — built for Assam TET, ADRE and Assam Police.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/signup" />}>
            Start free — no card
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button variant="outline" size="lg" render={<a href="#product" />}>
            <Play data-icon="inline-start" className="fill-current" />
            See what&apos;s inside
          </Button>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          First mock in every series is free · {TICKER.length}+ prep tools ·
          Assam-only content
        </p>
      </div>
```

### Target code

Add `content-enter` to the class list of each of the five children, and add
`style={{ "--enter-index": N } as React.CSSProperties}` with N = 0,1,2,3,4.
Nothing else changes — keep every existing class exactly as-is, append
`content-enter` at the end of the string.

```tsx
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-40 text-center">
        <span
          style={{ "--enter-index": 0 } as React.CSSProperties}
          className="content-enter inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          Assam TET 2026 series is live
        </span>

        <h1
          style={{ "--enter-index": 1 } as React.CSSProperties}
          className="content-enter mt-7 font-heading text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          Ace your{" "}
          <span className="text-primary italic underline decoration-primary/30 decoration-2 underline-offset-8">
            Assam
          </span>{" "}
          competitive exams
        </h1>
        <p
          style={{ "--enter-index": 2 } as React.CSSProperties}
          className="content-enter mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Full-length mocks, sectional drills, previous-year papers and honest
          analytics — built for Assam TET, ADRE and Assam Police.
        </p>

        <div
          style={{ "--enter-index": 3 } as React.CSSProperties}
          className="content-enter mt-9 flex flex-col items-center gap-3 sm:flex-row"
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
          className="content-enter mt-5 text-xs text-muted-foreground"
        >
          First mock in every series is free · {TICKER.length}+ prep tools ·
          Assam-only content
        </p>
      </div>
```

## Ordered steps

1. Open `apps/web/app/page.tsx`, go to `Hero()` (line 110).
2. For each of the 5 direct children of the `flex max-w-3xl flex-col` container
   (badge `<span>`, `<h1>`, subhead `<p>`, CTA `<div>`, trust `<p>`):
   - Prepend `content-enter ` to its existing `className` string (keep all
     existing classes).
   - Add `style={{ "--enter-index": N } as React.CSSProperties}` where N is the
     child's zero-based position (0 → 4, top to bottom).
3. Save. No other file changes.

## Scope boundaries (do NOT do)

- Do **not** touch `globals.css` — the `.content-enter` class and its
  reduced-motion fallback already exist and are correct.
- Do **not** add `motion/react`, `RevealItem`, `framer-motion`, or any JS
  animation. This is a server component; keep it JS-free.
- Do **not** convert `page.tsx` to a client component (`"use client"`).
- Do **not** animate any section below the hero (SneakPeek/Pricing/FAQ are
  separate sweep rows — 002+, not this plan).
- Do **not** change durations, easing, or the 6px travel distance. Do not raise
  the stagger above 40ms.
- Do **not** add `content-enter` to the inner `<span>Assam</span>` or the inner
  pulse dot — only the 5 top-level children.

## Verification

1. **Type/lint:** `pnpm --filter web check-types` and `pnpm --filter web lint`
   pass (the `as React.CSSProperties` cast is required — a bare
   `{ "--enter-index": 0 }` will fail TS).
2. **Runtime:** `pnpm --filter web dev`, hard-reload `http://localhost:3000/`.
   Hero elements fade up in sequence top→bottom on load.
3. **Feel-check (required):** Chrome DevTools → Rendering → enable
   "Emulate CSS media prefers-reduced-motion" → `reduce`. Reload. Elements
   should appear with **opacity only, no vertical travel, no stagger delay**
   (proves the existing `globals.css:207–214` fallback engages).
4. **Feel-check (motion):** DevTools → ⋮ → More tools → Animations, or throttle,
   reload and watch the cascade. The last element (trust line, index 4) should
   finish settling around ~380ms after first paint. If it feels slow or the
   stagger reads as "waterfall," the `--enter-index` values are too high —
   confirm they are 0,1,2,3,4 not larger.
5. **Regression:** confirm the emerald badge dot still pulses (its
   `animate-pulse` is independent and must be unaffected).

## Notes / uncertainty

- `@starting-style` support: Chrome/Edge 117+, Safari 17.5+, Firefox 129+.
  Older browsers skip the entry and show the final (visible) state instantly —
  a graceful no-op, never a broken hero. Acceptable degradation; no fallback
  needed.
- Feel is high-confidence here (fade + short rise, standard values), so no
  taste call is left to the executor. The only judgment is the stagger reading
  as a cascade, covered by feel-check step 4.
