# Migration Plan — Phased

Order matters: schema/auth/payment are load-bearing for everything else.
Don't start UI work before phase 2 is done, or you rebuild pages twice.

## Phase 0 — New repo skeleton

- `pnpm dlx create-turbo@latest` or hand-roll `apps/web`, `packages/{db,auth,core,ui}`
  matching [02-ARCHITECTURE.md](02-ARCHITECTURE.md).
- Copy `packages/ui` from the current repo close to verbatim — it's already
  shadcn-only, no rewrite needed, just re-audit for any leftover hand-rolled
  primitive before copying (grep for raw `<button`/`<input`/`<table` in
  `packages/ui/src`, fix on the way in, don't carry the debt forward).
- Supabase project → `DATABASE_URL` in `.env`.
- `turbo.json` → add `pnpm-lock.yaml` to `globalDependencies` (alongside
  `.env`/`.env.local`), so turbo busts cache on dependency changes:
  ```json
  "globalDependencies": [".env", ".env.local", "pnpm-lock.yaml"]
  ```
  Without this, a `pnpm install` that changes resolved versions won't
  invalidate cached task outputs — stale `node_modules` state could pass a
  cached `build`/`lint` that would actually fail on the new lockfile.

## Phase 1 — DB

- Copy `packages/db/prisma/schema.prisma` verbatim (see
  [03-DOMAIN-MODEL.md](03-DOMAIN-MODEL.md)) minus whatever Better Auth needs
  to own on the User side.
- `pnpm dlx prisma migrate dev` fresh against Supabase — don't try to
  replay old migration history onto a new DB, squash into one init migration.
- Re-run the seed script, adjusted for the new User shape.

## Phase 2 — Auth swap

- Add Better Auth to `packages/auth`, wire its Prisma adapter against the
  new schema's user table.
- Port session-check helpers (`packages/auth/src/session.ts`) to Better
  Auth's session API — same call sites in Server Components/Actions, new
  implementation underneath.
- Port `rate-limit.ts` / `redis.ts` as-is (Upstash, framework-agnostic).

## Phase 3 — Payment

- Port `apps/web/lib/razorpay.ts`, `pricing.ts`, `utils/razorpay-signature.ts`,
  `utils/payment-grant.ts`, `lib/actions/checkout.action.ts` — this flow is
  correct, rebuild it as-is against the new schema/auth, don't redesign the
  ₹50-flat + Plan-bundle model.
- Port the Razorpay webhook route under `app/api/`.
- Bring the existing payment/purchase tests over (`exam-purchase.test.ts`,
  `payment-grant.test.ts`) before writing new features — they're the
  regression net for money-handling code, worth more than new UI.

## Phase 4 — Content pipeline

- Copy `packages/core` (admin-content + validation) — this was already
  extracted cleanly into its own package, reuse it.
- Rebuild `app/admin` routes against it.

## Phase 5 — Core exam-taking flow

This is where the current repo's real mess lives
(`exam-attempt.action.ts` 759 lines, `useExamAttempt.ts` 451 lines, two
300+-line page components — see current repo's `TECH_DEBT.md` TD-2, TD-4).
Rebuild with the split this repo never got to do:
- Keep scoring/marking-scheme-resolution logic as pure functions, unit
  tested in isolation (this is exactly what current `TD-9` blocked on — fix
  the test-fixture speed problem *before* porting this logic, don't inherit
  a broken test suite into the new repo).
- Split attempt page into: instructions → in-progress attempt →
  submit/result, as separate route segments, not one mega client component.
- Anti-cheat rule (never leak `is_correct` mid-attempt) gets enforced at the
  data-fetching boundary (the Prisma query shape / `.omit()`), not by
  client-side hiding — carry this over exactly.

## Phase 6 — Everything else (dashboards, series listing, PYQ, study notes)

Lower risk, port page-by-page. Each page = one route folder + one
`<route>.action.ts`, per the flat convention. This is mechanical once
phases 1-3 are solid.

## What NOT to port

- The landing page (`app/page.tsx`) — already flagged as throwaway
  showcase in the current repo, don't waste rewrite effort on it.
- Any hardcoded mock data (`MOCK_EXAM_DATA` in current
  `app/exams/[id]/page.tsx`) — wire real queries from day one in the
  rewrite, don't reintroduce the placeholder.
- `specific-test-series.ts` naming inconsistency — name it
  `specific-test-series.action.ts` correctly from the start.
