# Architecture — Target Stack

## Reality check first

This repo is **not** greenfield today — it's already a Turborepo:

```
apps/web            # Next.js app
packages/db          # Prisma schema + generated client
packages/auth        # NextAuth v5 config, redis, rate-limit
packages/core        # admin-content pipeline + validation
packages/ui           # shadcn components (button, card, table, chart, sidebar, ...)
```

~15.7k lines in `apps/web`, real tests, real Razorpay payments, a
`react-doctor` pass already done (score 51→68), pre-launch TODOs tracked.
The "mess" is inside `apps/web` (giant page components, some ad-hoc access
checks, mock data left in), not the monorepo shape itself.

**Recommendation:** don't discard `packages/db` (schema is correct, keep it
verbatim), `packages/ui` (already shadcn-only), or `packages/core`
(admin-content pipeline). Rebuild `apps/web` cleanly and swap
`packages/auth` to Better Auth. See [04-MIGRATION-PLAN.md](04-MIGRATION-PLAN.md)
for the actual carry-over vs rebuild split. If the new repo genuinely starts
at zero, this document is still the target shape to converge on.

## Stack decisions (locked)

| Layer | Choice | Notes |
|---|---|---|
| Monorepo | Turborepo, pnpm workspaces | forever |
| DB | Postgres, `DATABASE_URL` pointed at Supabase for now | swap to AWS RDS/Aiven later = **env var change only**, never a code change, because... |
| ORM | Prisma | forever, non-negotiable, no raw SQL except typed `$queryRaw` when Prisma truly can't express it |
| Auth | Better Auth | replaces NextAuth in `packages/auth` |
| Payments | Razorpay | same flow, same pricing (₹50/exam flat, `Plan`-based bundles) |
| Component library | shadcn/ui only | zero hand-rolled primitives, ever |
| Icons | Heroicons | unchanged |
| Package manager / runtime | pnpm exclusively | `pnpm`/`pnpm dlx`, never npm/yarn/bun |

## Why Supabase-now / AWS-or-Aiven-later is free

Because Prisma is the only data layer, the datasource is just a connection
string (`packages/db/prisma/schema.prisma` → `datasource db { provider =
"postgresql" }`). Migrating hosts later means changing `DATABASE_URL` +
running `prisma migrate deploy` against the new host. **Never let
Supabase-specific features (RLS policies, Supabase Auth, Supabase Storage,
realtime) leak into application code** — that's what would make a later
move expensive. Use Supabase as "a Postgres URL," nothing more.

## Folder shape for `apps/web`

```
apps/web/
  app/                     # routes — RSC pages read DB directly via packages/db
    (auth)/
    (dashboards)/
    admin/
    exams/
  components/              # app-specific composition only — shadcn primitives live in packages/ui
  lib/
    actions/               # "use server" mutations — one <route>.action.ts per feature, flat
    validations/           # Zod schemas
    types/                 # hand-written types ONLY where client shape != DB shape (e.g. stripped is_correct)
    utils/                 # access-control, payment-grant, exam-navigation helpers
```

### "Server calls in a different folder" — already the right pattern

Two distinct kinds of server-side data access, keep them visibly separate:

1. **RSC direct reads** — a Server Component importing `@repo/db` and
   calling `prisma.exam.findMany(...)` straight in the page body. Use this
   for page-load data, nothing else.
2. **`lib/actions/*.action.ts`** — `"use server"` files for mutations
   (checkout, submit answer, admin publish) and any read that needs
   input validation / auth check before running. One file per
   page/feature, flat, no subfolders. This convention already exists in the
   current repo (`AGENTS.md` §3.6) — keep it exactly, don't redesign it.

Don't invent a third pattern (no tRPC, no separate API-route layer for
things Server Actions already cover) unless a client genuinely outside
Next.js (mobile app, external webhook consumer) needs it — `app/api/` stays
reserved for that (e.g. Razorpay webhooks).

## Type safety (unchanged rule)

- Every action: explicit input type (Zod-parsed) + explicit return type.
- Prefer Prisma-generated types (`Prisma.ExamGetPayload<...>`) over hand
  rolled interfaces. Hand-write a type only when client shape != DB shape
  (stripping `is_correct` is the canonical case).

## Components (unchanged rule, stricter)

- Never write `<button>`, `<input>`, `<table>`, a custom SVG chart, etc.
  shadcn/ui has all of these (`chart` is recharts-based) — check
  https://ui.shadcn.com/docs/components before writing any UI primitive.
- Always ask before `pnpm dlx shadcn add <component>`.
- Design tokens only, no arbitrary Tailwind values — semantic classes from
  `globals.css` (`bg-background`, `text-muted-foreground`, etc), both
  `:root` and `.dark`.
