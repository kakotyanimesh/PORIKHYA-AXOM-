# Prompt Sequence — Build Order, Paste-Ready

You said you'll `pnpm dlx create-turbo@latest` the repo yourself. This is what to tell
Claude at each step, in your exact order. One step = one prompt = one
reviewed commit before moving to the next. Don't batch steps — each depends
on the previous one existing and working.

## Two rules baked into this sequence (read once, applies everywhere below)

1. **No `UserProgress`/`UserResponse`.** No per-question answer log, no
   resumable in-progress state, no attempt history table. Replace with one
   flat `ExamAttempt` row per (user, exam) — see step 2 and step 14.
2. **One attempt, ever, locked at start — not completion.** The lock row is
   created the moment the user *begins* the exam, enforced by a DB unique
   constraint (`@@unique([user_id, exam_id])`), not app-level logic. If they
   abandon mid-exam (crash, close tab), that attempt is burned — no resume,
   no retry. This is deliberately harsher than the old repo's retake-
   friendly `attempt_number` design. Don't soften it unless you say so.

---

### 1. Idea

Already written — point Claude at `rewrite-guide/01-VISION.md` instead of
re-explaining the product each time you open a new session.

> Read `rewrite-guide/01-VISION.md` and `rewrite-guide/02-ARCHITECTURE.md`
> in this repo before doing anything. This is the spec for what we're
> building.

### 2. Schema

> Create `packages/db/prisma/schema.prisma`. Base it on
> `rewrite-guide/03-DOMAIN-MODEL.md` — carry over `User`, `Exam`,
> `Subsection`, `Question`, `Option`, `Plan`, `Subscription`,
> `SubscriptionExam`, `ExamPurchase`, `Payment` as described there.
>
> Do NOT create `UserProgress` or `UserResponse`. Instead create a single
> `ExamAttempt` model:
> - `id`, `user_id` (FK User), `exam_id` (FK Exam)
> - `started_at` (default now)
> - `completed_at` (nullable — null means abandoned/in-progress, but there
>   is no resume path for it)
> - `raw_score`, `final_score`, `percentage` (nullable, filled in at submit)
> - `correct_answers`, `incorrect_answers`, `skipped_questions` (nullable,
>   filled in at submit)
> - `@@unique([user_id, exam_id])` — this is the one-attempt-ever lock,
>   enforce it at the DB level, not just in application code.
>
> Run `pnpm dlx prisma migrate dev --name init` against the Supabase
> `DATABASE_URL` once the schema looks right. Show me the schema before
> migrating.

**Check before moving on:** read the generated migration SQL yourself,
confirm the unique constraint is really there.

### 3. Better Auth

> Set up `packages/auth` with Better Auth, Prisma adapter, pointed at the
> `User` model in `packages/db`. Email/password only for now — no OAuth
> providers unless I ask. Wire session helpers the same call shape as
> `getServerSession`/`auth()` so pages can check auth with one call.

**Check:** sign up a test user via a scratch script or Prisma Studio, confirm
the row lands correctly, confirm session cookie round-trips.

### 4. Add shadcn components

> Init shadcn in `packages/ui`. Add: button, input, card, form, dialog,
> label. Don't add anything else yet — I'll ask for more as we need them.

Confirm the exact component list with you before it runs `shadcn add` —
this repo's rule is always ask before installing.

### 5. Auth pages

> Build `app/(auth)/signin` and `app/(auth)/signup` in `apps/web` using
> Better Auth's client hooks and the shadcn `form`/`input`/`button`
> components from `packages/ui`. No hand-rolled inputs or buttons.

Load `/apple-design` and `/emil-design-eng` before this one — first real UI
in the new repo, worth getting the interaction feel right from the start.

**Check:** actually sign up and sign in in a browser, not just typecheck.

### 6. All-test-series page — backend

> Create `lib/actions/all-test-series.action.ts`. One Server Action:
> `getAllTestSeries()` returning all active `Exam` rows grouped by
> `series_name`, each with `id`, `name`, `subject`, `category`,
> `total_questions`, `duration_minutes`. Explicit Zod input type (none
> needed here, empty input) and explicit return type — don't hand-roll the
> return type, derive it from `Prisma.ExamGetPayload`.

### 7. All-test-series page — listing exam-wise

> Build the `app/(dashboards)/all-test-series` Server Component. Fetch via
> `getAllTestSeries()`, group into series → exam list in the page itself
> (don't push grouping logic into the action — keep the action a flat
> query, grouping is a presentation concern).

### 8. Rendering test series in UI

> Now do the actual visual layout for that page: series as sections, exams
> as cards (shadcn `card`), using existing tokens from `globals.css` — no
> arbitrary Tailwind colors. Check `/shadcn` for anything more we need
> (badge for category/free tag, etc) before hand-rolling.

Load `/emil-design-eng` again here — this is the page most users see first.

### 9. Razorpay system

> Port the Razorpay integration: `lib/razorpay.ts` (client init),
> `lib/pricing.ts` (`SINGLE_TEST_PRICE_INR = 50`, `toPaise()`),
> `lib/utils/razorpay-signature.ts` (webhook signature verify),
> `app/api/webhooks/razorpay/route.ts`. Same flow as documented in
> `rewrite-guide/02-ARCHITECTURE.md` — flat ₹50/exam one-time purchase via
> `ExamPurchase`, plan bundles via `Subscription`. Don't invent a new
> pricing model.

Run `/security-review` on this before merging — signature verification is
the one place a bug is actually dangerous (fake payment confirmations).

### 10. Payment block on exam listing, first exam free

> On the all-test-series listing, gate each exam card: if `is_free` and the
> user has no `ExamAttempt` row for it yet, show "Start Free". Otherwise
> show "Buy ₹50" / "Unlock with Plan" depending on whether they already have
> an `ExamPurchase` or an active `Subscription` covering it. Access check
> logic goes in `lib/utils/subscription-access.ts` — one function, reused by
> both this page and the actual attempt-start guard in step 13. Don't
> duplicate the access-check logic between the listing page and the attempt
> guard.

### 11. Payment integration

> Wire the actual checkout: `lib/actions/checkout.action.ts` creates a
> Razorpay order, client opens Razorpay checkout modal, on success the
> webhook (step 9) grants access by creating the `ExamPurchase` or
> `Subscription` row. Reuse the checkout.action.ts pattern from
> `rewrite-guide/04-MIGRATION-PLAN.md` phase 3 — don't design the grant flow
> from scratch.

**Check:** do one real test payment (Razorpay test mode), confirm the
`ExamPurchase`/`Payment` rows land and access actually unlocks.

### 12. Instruction page

> Build `app/exams/[id]/page.tsx` — real Exam + Subsection data (marking
> scheme, duration, total questions), not mock data. Before showing this
> page, check: does an `ExamAttempt` row already exist for this user+exam?
> If yes, redirect to a "you've already attempted this exam" page (show the
> stored `final_score`/`percentage` if `completed_at` is set, or "attempt
> forfeited" if it isn't). "Start Exam" button is what creates the
> `ExamAttempt` row — that's the one-time lock, right here.

This is the step where the one-attempt rule actually gets enforced — read it
back carefully before moving on.

### 13. Exam question calling — fast call, minimum loading

> Build the attempt page. Fetch all questions for the exam (with options,
> `is_correct` omitted) in a single Server Action call when the attempt
> starts — one round trip, not per-question. Hold answers in client state
> only (`useState`/`useReducer`), no server writes until final submit. This
> is simpler than the old repo's `useQuestionBatcher` because there's no
> mid-attempt autosave to manage anymore — no `UserResponse` rows to write
> as they go.

**Check:** open devtools network tab, confirm it's one query at load, zero
requests per answer click.

### 14. Marks calculation

> On submit, one Server Action: take the full answer payload
> (`{questionId, selectedOptionId}[]`) from the client, look up correct
> options from `Question`/`Option` server-side (never trust a client-sent
> correctness flag), apply the marking-scheme-resolution rule (Subsection
> override falls back to Exam default), compute `raw_score`, `final_score`,
> `percentage`, `correct_answers`, `incorrect_answers`, `skipped_questions`.
> Write all of it into the *same* `ExamAttempt` row created in step 12
> (`completed_at = now()`, plus the score fields). This is the only write
> that happens during the whole attempt besides the initial lock row.

### 15. Render marks

> Result page reads the `ExamAttempt` row (now completed) and renders score,
> percentage, pass/fail against `pass_score_percent`. Use shadcn `chart` if
> you want a score breakdown visual — don't hand-roll SVG.

---

## After each step

Run `react-doctor` if it's a UI step, `/code-review` on the diff regardless.
Don't let three steps pile up before a review — each step above is small
enough to review on its own, and money/access-control steps (9-13) are
exactly where a silent bug costs real rupees or gives away a paid exam.
