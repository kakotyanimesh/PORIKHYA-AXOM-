# porikhyaaxom — CLAUDE.md

Mock-test / exam-prep platform for Assam-specific competitive exams (Assam
TET, Assam SI/Police, APSC, ADRE, etc). Full rewrite in progress. Full spec
lives in `guide/` — read the relevant file before touching that area, don't
re-derive from memory:

- `guide/01-VISION.md` — product, content hierarchy, monetization, anti-cheat
- `guide/02-ARCHITECTURE.md` — stack, folder shape, type-safety rules
- `guide/03-DOMAIN-MODEL.md` — Prisma schema shape and why
- `guide/04-MIGRATION-PLAN.md` — phase order
- `guide/05-SKILLS-GUIDE.md` — which skill to reach for per phase
- `guide/06-PROMPT-SEQUENCE.md` — exact step-by-step build order, don't skip
  ahead of the current phase

## Core loop

Student picks exam → attempts (timed, negative marking) → sees scored result
→ subscribes/pays to unlock more exams → repeats.

## Content hierarchy

- **Series** — not a table, `Exam.series_name`. Group-by, never a real entity.
- **Exam** — one test. Own duration, negative-marking default, pass score,
  subject/category.
- **Subsection** — section inside an Exam, own `marks_per_question` /
  `negative_marking_ratio`, overrides parent. Attemptable standalone.
- **Question / Option** — MCQ. `Option.is_correct` never reaches the client
  during an active attempt.

## Monetization

Two purchase paths, both via Razorpay:

- **Per-exam, one-time** — flat ₹50 (`SINGLE_TEST_PRICE_INR`), creates an
  `ExamPurchase` row (not a Subscription row — must survive independent of
  subscription state).
- **Plan/bundle, time-boxed** — `Plan` (`category_grants[]`, `duration_days`)
  → `Subscription` (**one active per user**, enforced by a partial unique
  index, raw SQL — not a plain `@@unique`) → `SubscriptionExam` rows grant
  every `Exam` in the bought categories.

Access to an exam = OR of: `is_free`, OR `ExamPurchase` exists, OR active
`Subscription` grants it via `SubscriptionExam`. Never assume free by default.

Free/ungated: `PreviousYearPaper` (SEO), first `StudyTopic` per subject.

## Attempt model (rewrite change — overrides old `UserProgress`/`UserResponse`)

No per-question answer log, no resumable attempts. One `ExamAttempt` row per
(user, exam), locked at **start** not completion:

- `@@unique([user_id, exam_id])` at the DB level — one attempt ever.
- Abandon mid-exam (crash, close tab) = attempt burned, no resume, no retry.
- Answers held in client state only during the attempt; single Server Action
  on submit computes and writes `raw_score`/`final_score`/`percentage`/
  `correct_answers`/`incorrect_answers`/`skipped_questions`/`completed_at`
  into that same row. No writes in between.

## Anti-cheat

Never send `Option.is_correct` to the client while an attempt is in
progress. Enforce at the data-fetching boundary (Prisma query shape /
`.omit()`), not client-side hiding. Correctness is always computed
server-side on submit from the client's `{questionId, selectedOptionId}[]`
payload — never trust a client-sent correctness flag.

## Stack (locked)

| Layer | Choice |
|---|---|
| Monorepo | Turborepo, pnpm workspaces |
| DB | Postgres via `DATABASE_URL` (Supabase for now — swap later is an env var change only, never code; don't let Supabase-specific features like RLS/Auth/Storage leak into app code) |
| ORM | Prisma, forever. No raw SQL except typed `$queryRaw` when Prisma truly can't express it |
| Auth | Better Auth (Prisma adapter, email/password only unless asked) |
| Payments | Razorpay |
| Components | shadcn/ui only — zero hand-rolled primitives. Check https://ui.shadcn.com/docs/components before writing any UI primitive. Always ask before `pnpm dlx shadcn add <component>` |
| Icons | Heroicons |
| Package manager | pnpm exclusively — never npm/yarn/bun |

## Folder shape

```
apps/
  web/                     # student-facing app
    app/                     # routes — RSC pages read DB directly via packages/db
      (auth)/
      (dashboards)/
      exams/
    components/              # app-specific composition only — primitives live in packages/ui
    lib/
      actions/               # "use server" mutations, one <route>.action.ts per feature, flat
      validations/           # Zod schemas
      types/                 # hand-written ONLY where client shape != DB shape
      utils/                 # access-control, payment-grant, exam-navigation helpers
  admin-app/               # separate app for admin/content-management, own auth-gated deploy
packages/
  db/                      # Prisma schema + generated client
  auth/                    # Better Auth config, redis, rate-limit
  core/                    # admin-content pipeline + validation, consumed by admin-app
  ui/                      # shadcn components, shared across apps
```

**No `app/admin` route inside `apps/web`.** Admin/content-management is its
own Turborepo app at `apps/admin-app`, built later, sharing `packages/{db,auth,core,ui}`.
Don't reintroduce admin routes into `apps/web` — `guide/04-MIGRATION-PLAN.md`
phase 4 mentions `app/admin` from the old single-app repo; that's superseded
by this split.

Two kinds of server-side data access, keep visibly separate:
1. **RSC direct reads** — Server Component imports `@repo/db`, calls
   `prisma.exam.findMany(...)` in the page body. Page-load data only.
2. **`lib/actions/*.action.ts`** — `"use server"` for mutations and any read
   needing validation/auth first. One file per page/feature, flat, no
   subfolders.

No tRPC, no separate API-route layer for things Server Actions already
cover. `app/api/` reserved for real external clients (Razorpay webhooks).

## Type safety

Every action: explicit Zod-parsed input type + explicit return type. Prefer
`Prisma.ExamGetPayload<...>` over hand-rolled interfaces. Hand-write a type
only when client shape != DB shape (stripping `is_correct` is the canonical
case).

## Build order

Follow `guide/06-PROMPT-SEQUENCE.md` step by step — schema → Better Auth →
shadcn init → auth pages → listing page → Razorpay → access gating →
checkout → instructions/attempt-lock → attempt-taking → scoring → results.
Don't jump ahead of the current phase, later steps assume earlier ones are
reviewed and working. One step = one reviewed commit.

Money/access-control steps (Razorpay, checkout, purchase gating, attempt
lock) get `/security-review` before merge — a silent bug there costs real
rupees or gives away a paid exam.

## Don't

- Don't model Series as a real table.
- Don't add `UserProgress`/`UserResponse` — `ExamAttempt` only.
- Don't soften the one-attempt-ever lock without being told to.
- Don't write a hand-rolled `<button>`/`<input>`/`<table>`/SVG chart —
  shadcn has it.
- Don't let Supabase-specific features leak into app code.
- Don't port the old landing page or any `MOCK_EXAM_DATA` — real queries
  from day one.
