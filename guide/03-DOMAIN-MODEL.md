# Domain Model — Carry Over Verbatim

Source of truth: `packages/db/prisma/schema.prisma` in the current repo.
Copy this schema into the new repo close to as-is — it's correct, it's the
part of the codebase that isn't the mess. Only change: table/enum additions
if a genuinely new requirement shows up, not a redesign.

> **Amendment (overrides `UserProgress`/`UserResponse` below):** the
> rewrite drops per-question answer persistence and resumable attempts
> entirely. Replace both models with `ExamAttempt` — see
> [06-PROMPT-SEQUENCE.md](06-PROMPT-SEQUENCE.md) step 14 for the exact shape
> and why. One attempt per user per exam, ever, locked at attempt *start*,
> not completion.

## Models and what they mean

- **User** — email/password (`password_hash`). Better Auth will own this
  table's shape going forward (see below) — don't hand-roll auth columns
  again once Better Auth is wired in.
- **Exam** — one test. `is_free` = one-attempt teaser. `is_pyq_public` +
  `year` = explicit allowlist for public SEO pages, deliberately separate
  from `is_free` so a query bug can never expose a currently-selling exam.
- **Subsection** — section inside an Exam, own marking overrides, can be
  attempted standalone.
- **Question / Option** — MCQ content, bilingual fields (`content_assamese`,
  `text_assamese`), `Option.is_correct` gated from client mid-attempt.
- **AnswerCorrection** — audit log for post-publish content fixes made via
  admin. `option_id` is a bare column (not FK) — historical log must survive
  independent of the row it describes.
- **UserProgress** — one row per attempt (`attempt_number` allows retakes).
  Scores, status (`in_progress`/`completed`), timing.
- **UserResponse** — one row per answered question in an attempt.

## Payment/access models

- **Plan** — a bundle: `price`, `duration_days`, `category_grants[]`.
- **Subscription** — buying a Plan. **One active subscription per user**,
  enforced by a *partial unique index* (`WHERE is_active = true`) via raw SQL
  migration — not expressible as a plain `@@unique` in Prisma DSL (Postgres
  treats `is_active: false` as a duplicable value, so a plain unique would
  cap a user at one *inactive* row too and crash on their 3rd renewal).
  Carry the raw-SQL migration over, don't "simplify" it back to `@@unique`.
- **SubscriptionExam** — join table, which exams an active Subscription
  grants.
- **ExamPurchase** — one-time ₹50 single-exam buy. Deliberately **not** a
  Subscription row — the partial-unique-active-subscription constraint would
  make a later plan purchase silently orphan this paid access. Access is the
  OR of subscription grants and these rows.
- **Payment** — money trail. Belongs to exactly one of `subscription_id` /
  `exam_purchase_id` (both optional at schema level, grant code always sets
  exactly one). `onDelete: Restrict` on both — a payment row must never be
  silently destroyed by deleting the exam/subscription it paid for.

## Free-content models

- **PreviousYearPaper** — free, ungated, keyed by `ExamCategory` enum +
  year. Public storage URL, no streaming route.
- **StudyTopic** — gated study notes. `category` matches
  `Plan.category_grants` vocabulary. `pdf_url` is a **private** object key,
  served only via short-TTL presigned URL behind an access check — never
  return the raw key to the client. First topic per subject is `is_free`.

## Access control rule (don't relax this)

Before serving exam content: check `is_free` (one free attempt) OR
`ExamPurchase` for that `exam_id` OR active `Subscription` →
`SubscriptionExam` for that `exam_id`. Never assume an exam is free by
default.

## Marking scheme resolution

Check `Subsection.marks_per_question` / `negative_marking_ratio` first, fall
back to parent `Exam.negative_marking` only if the subsection doesn't
override.

## Auth change: NextAuth → Better Auth

Current `User` model has `password_hash` managed by NextAuth v5
(`packages/auth/src/nextauth.ts`). Better Auth owns its own user/session/
account tables by convention — plan the schema migration as: Better Auth's
generated auth tables + a slimmed `User` (or merge Better Auth's `user`
table with the app's, per Better Auth's Prisma adapter docs) that
`Subscription`/`UserProgress`/`Payment`/etc still foreign-key against by
`user_id`. Don't invent a custom bridge table — Better Auth's Prisma adapter
is designed to let other models FK straight to its `user` table.
