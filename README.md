# PorikhyaAxom

Mock-test / exam-prep platform for Assam-specific competitive exams — Assam TET,
Assam SI/Police, APSC, ADRE and more.

Students pick an exam, attempt it (timed, with negative marking), see a scored
result, and subscribe or pay per-test to unlock more. Built as a Turborepo
monorepo with a student app and a separate admin/content app sharing common
packages.

> **Note:** This is a private, source-available project. It is documented like an
> open-source project for the benefit of future contributors, but it is not open
> for public contribution or redistribution.

---

## Stack

| Layer | Choice |
| --- | --- |
| Monorepo | Turborepo + pnpm workspaces |
| Framework | Next.js (App Router, React Server Components) |
| Language | TypeScript (strict) |
| Database | PostgreSQL (Supabase-hosted for now; swappable via `DATABASE_URL`) |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Auth | Better Auth (email/password + Google, email verification, DB rate-limiting) |
| Payments | Razorpay |
| Email | Resend (transactional, via REST — no SDK) |
| UI | shadcn/ui + Tailwind, Base UI primitives |
| Icons | Heroicons / lucide |

---

## Repository layout

```
apps/
  web/          # student-facing app        (dev: http://localhost:3000)
  admin-app/    # admin / content management (dev: http://localhost:3001)
packages/
  db/           # Prisma schema, migrations, generated client  (@repo/db)
  auth/         # Better Auth config, client, email transport   (@repo/auth)
  core/         # admin content pipeline + validation           (@repo/core)
  ui/           # shared shadcn components                       (@repo/ui)
guide/          # full product + architecture spec (read before building)
```

The `guide/` directory holds the authoritative spec — vision, architecture,
domain model, migration plan, and build order. Read the relevant file before
working on an area.

---

## Prerequisites

- **Node.js** ≥ 18 (20 LTS recommended)
- **pnpm** 9 (`corepack enable` then `corepack prepare pnpm@9 --activate`, or
  `npm i -g pnpm@9`)
- A **PostgreSQL** database (a Supabase project works out of the box)

This repo uses pnpm exclusively — do not use npm or yarn.

---

## Quick start

```bash
# 1. Install dependencies (all workspaces)
pnpm install

# 2. Configure environment (see the Environment section below)
cp packages/db/.env.example  packages/db/.env
cp apps/web/.env.example     apps/web/.env
cp apps/admin-app/.env.example apps/admin-app/.env
# ...then fill in real values

# 3. Generate the Prisma client and apply migrations to your database
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db db:deploy

# 4. Run everything in dev
pnpm dev
```

- Student app → http://localhost:3000
- Admin app → http://localhost:3001

To run a single app: `pnpm --filter web dev` or `pnpm --filter admin-app dev`.

---

## Environment variables

Env is split by where it is consumed. Next.js loads each app's `.env` from the
app directory; the Prisma CLI loads `packages/db/.env`. Runtime DB access in the
apps also needs `DATABASE_URL` in the app `.env`.

### `packages/db/.env` — Prisma CLI (migrations)

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Postgres connection string. On Supabase, the session-mode pooler (port 5432). Used for migrations and runtime. |
| `DIRECT_URL` | ✅ | Direct Postgres connection (Supabase transaction-mode pooler). Used by Prisma tooling. |

### `apps/web/.env` — student app

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Same value as above; runtime Prisma reads this. |
| `BETTER_AUTH_SECRET` | ✅ | Random 32+ byte secret. Generate: `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | ✅ | App origin, e.g. `http://localhost:3000` (prod: your deployed URL, no trailing slash). Powers verification/callback links. |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | ✅ | Same origin, exposed to the browser (auth client). |
| `GOOGLE_CLIENT_ID` | ✅* | Google OAuth client ID. *Required only if Google sign-in is enabled. |
| `GOOGLE_CLIENT_SECRET` | ✅* | Google OAuth client secret. |
| `RESEND_API_KEY` | ✅ | Resend API key. Email verification will not send without it. |
| `RESEND_FROM` | ✅ | Sender, e.g. `PorikhyaAxom <no-reply@yourdomain>`. Until a domain is verified in Resend, use `onboarding@resend.dev` (only delivers to your own Resend account email). |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay key id (server). |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay key secret (server). |
| `RAZORPAY_WEBHOOK_SECRET` | ✅ | Secret used to verify Razorpay webhook signatures. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✅ | Razorpay key id, exposed to the browser checkout. |

### `apps/admin-app/.env` — admin app

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Same Postgres connection string. |
| `BETTER_AUTH_SECRET` | ✅ | Same secret as the web app. |
| `BETTER_AUTH_URL` | ✅ | Admin app origin, e.g. `http://localhost:3001`. |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | ✅ | Same origin, browser-exposed. |
| `ADMIN_EMAILS` | ✅ | Comma-separated allowlist of emails permitted into the admin app. |

**Where to get keys:** Google OAuth → [Google Cloud Console](https://console.cloud.google.com/apis/credentials);
Razorpay → [Razorpay Dashboard](https://dashboard.razorpay.com/) → API Keys / Webhooks;
Resend → [resend.com](https://resend.com/) → API Keys (free tier: 3,000 emails/month).

---

## Database & migrations

Prisma schema lives in `packages/db/prisma/schema.prisma`; the client is
generated into `packages/db/src/generated`.

```bash
# Generate the client after a schema change
pnpm --filter @repo/db db:generate

# Create + apply a new migration in development (interactive)
pnpm --filter @repo/db db:migrate:dev

# Apply pending migrations to a database (CI / production)
pnpm --filter @repo/db db:deploy

# Open Prisma Studio
pnpm --filter @repo/db studio
```

Non-interactive environments (CI, background agents) cannot run
`migrate dev`. Generate SQL with `prisma migrate diff --from-config-datasource
--to-schema prisma/schema.prisma --script`, place it in a timestamped folder
under `prisma/migrations/`, then run `db:deploy`.

Some constraints (e.g. the partial unique index for one active subscription per
`(user, plan)`) are hand-written raw SQL in a migration — Prisma's DSL can't
express them.

---

## Scripts

Run from the repo root:

| Command | Does |
| --- | --- |
| `pnpm dev` | Run all apps in dev (Turborepo) |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all workspaces |
| `pnpm check-types` | Type-check all workspaces |
| `pnpm format` | Prettier write across the repo |
| `pnpm doctor` | Run React Doctor diagnostics |

Scope any task to one workspace with `--filter`, e.g.
`pnpm --filter web check-types`.

---

## Deployment

Each app deploys independently (e.g. Vercel), pointed at the same Postgres
database:

1. Set all environment variables for the app in the host's project settings.
2. Run `pnpm --filter @repo/db db:deploy` against the production database when
   migrations are pending (the app build only runs `prisma generate`, not
   migrate).
3. Set `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` to the deployed origin,
   and verify a sending domain in Resend before real users sign up.

---

## Documentation

- `guide/01-VISION.md` — product, content hierarchy, monetization, anti-cheat
- `guide/02-ARCHITECTURE.md` — stack, folder shape, type-safety rules
- `guide/03-DOMAIN-MODEL.md` — Prisma schema shape and rationale
- `guide/04-MIGRATION-PLAN.md` — phase order
- `guide/05-SKILLS-GUIDE.md` — tooling per phase
- `guide/06-PROMPT-SEQUENCE.md` — step-by-step build order
- `CLAUDE.md` — conventions and hard rules for working in this repo

---

## License

Private and proprietary. All rights reserved. Not licensed for public use,
redistribution, or contribution.
