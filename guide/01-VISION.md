# Vision — What This Platform Is

Mock-test / exam-prep platform for Assam-specific competitive exams (Assam
TET, Assam SI/Police recruitment, APSC, ADRE, etc). Same category as Testbook
or Oliveboard, regionally focused.

## Core loop

Student picks exam → attempts (timed, negative marking) → sees scored result
→ subscribes/pays to unlock more exams → repeats.

## Content hierarchy (truth, carries into rewrite unchanged)

- **Series** — not a table. `Exam.series_name`. A series is a named group of
  exams ("Assam TET 2026 Full Course"). Series page = filtered `Exam` list.
- **Exam** — one test, full-length or sectional. Own duration, negative
  marking default, pass score, subject/category.
- **Subsection** — section inside an Exam ("General English", "Reasoning").
  Own `marks_per_question` / `negative_marking_ratio`, overrides parent Exam.
  Can be attempted standalone as a sectional mock.
- **Question / Option** — MCQ content. `Option.is_correct` never reaches
  client during an active attempt.

**Exam ≠ Series.** Never model series as a real entity — it's a group-by.

## Monetization (truth, carries into rewrite unchanged)

Two purchase paths, both live via Razorpay:

- **Per-exam, one-time**: flat ₹50/exam (`SINGLE_TEST_PRICE_INR`), permanent
  access to that one exam. Not a subscription row — a separate `ExamPurchase`
  grant, so it survives independent of subscription state.
- **Plan/bundle, time-boxed**: `Plan` (name, price, duration_days,
  `category_grants[]`) → buying creates a `Subscription` (one *active* per
  user, enforced by a partial unique index) → grants every `Exam` in the
  bought categories via `SubscriptionExam` rows.

Access to an exam = **OR** of: exam is `is_free` (one free attempt teaser),
OR an `ExamPurchase` row exists, OR an active `Subscription` grants it via
`SubscriptionExam`.

Free content, no gate: `PreviousYearPaper` (PYQ, SEO-facing), and one free
`StudyTopic` per subject as a teaser (rest gated by `category_grants`).

## Anti-cheat (truth, carries into rewrite unchanged)

Never send `Option.is_correct` to the client while `UserProgress.status ===
"in_progress"`. Only after the attempt completes.

## Why rewrite

Current repo (`assammocktest`, this directory) already carries the above
correctly, but the codebase around it got messy pre-launch. See
[02-ARCHITECTURE.md](02-ARCHITECTURE.md) for what actually needs rebuilding
vs what's already right and should just move over.
