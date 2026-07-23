# Skills Guide — When to Use What

## Per rewrite-phase routing

| Phase | Skill | Why |
|---|---|---|
| Any planning step | `/spec` | turn "rebuild the exam-attempt flow" into a precise executable spec before coding, same discipline this repo already uses (`specs/<feature>/plan.md`) |
| Architecture decisions (phase 0-2) | `/plan-eng-review` | pressure-test the turborepo/auth-swap plan before committing code |
| Before writing any new UI/component (all phases) | `/shadcn` | check shadcn has the primitive first — non-negotiable per this project's rules |
| Writing/reviewing any new UI or page | `/apple-design` + `emil-design-eng` | motion/interaction feel + polish philosophy, invoke *before* writing markup, not after |
| Auth swap (phase 2) | `/investigate` | if Better Auth's Prisma adapter behaves unexpectedly against the ported schema, this is systematic-debugging territory, not guesswork |
| Payment porting (phase 3) | `/security-review` | money-handling code — signature verification, webhook auth — gets one before merge, every time |
| Content pipeline (phase 4) | check `.agents/skills` conventions in the new repo the same way this repo's `AGENTS.md` §3.3 mandates | keep the repo-specific-skill habit alive in the new repo from day one |
| After any nontrivial diff (all phases) | `/code-review` (or `/review` for a PR) | correctness + reuse/efficiency check before it lands |
| Quality-only pass after a diff | `/simplify` | reuse/simplification/efficiency cleanup, doesn't hunt bugs — pair with `/code-review` for that |
| Before committing any runtime change | `verify` skill | actually exercise the flow end-to-end, not just typecheck |
| Finishing a feature / before commit | `react-doctor` | lint + a11y + bundle + architecture scan — this repo's own `TECH_DEBT.md` came from exactly this pass, run it early and often in the new repo instead of accumulating debt first |
| Ship/deploy | `/ship` or `/land-and-deploy` | same as current repo |
| QA on any live page | `/qa` or `/qa-only` | skip the landing page in scope, same rule as current `CLAUDE.md` |

## Recommended default set for "write better React code"

These four cover correctness, performance, and taste — run them as a normal
part of the loop, not a special occasion:

1. **`react-doctor`** — the actual diagnostic tool (lint rules, a11y,
   bundle-size, architecture smells like giant components). Run it *during*
   the rewrite, phase by phase, not as one big cleanup pass at the end —
   that's the mistake that built up the current `TECH_DEBT.md`.
2. **`vercel-react-best-practices`** — Next.js/React perf patterns
   (Server Components, data-fetching placement, bundle discipline). Load it
   whenever writing/refactoring a component or page, not just on request.
3. **`/shadcn`** — enforces the "no hand-rolled primitive" rule mechanically
   instead of relying on memory every time.
4. **`ponytail`** (already active this session) — keeps the rewrite from
   recreating the mess: no speculative abstraction, no config for values
   that never change, shortest diff that's still correct. This is the most
   important one for a from-scratch rewrite — greenfield code is exactly
   where over-engineering creeps in because there's no existing pattern
   forcing restraint yet.

Motion-specific, only when actually touching animation:
`animation-vocabulary` (naming), `review-animations` (standards check on a
diff), `find-animation-opportunities` (read-only survey, doesn't apply
changes) — this repo already uses `motion.dev`, keep that choice.

## Don't reach for

- `/design-shotgun` / `/design-consultation` — this rewrite has a locked
  visual direction already (shadcn + existing token system); these are for
  picking a design system from scratch, which isn't the open question here.
- `/office-hours` / `/plan-ceo-review` — product idea and business model are
  already decided (see [01-VISION.md](01-VISION.md)); don't re-litigate scope
  through these mid-rewrite.
