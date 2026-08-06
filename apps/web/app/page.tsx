import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Play,
  Check,
  Sparkles,
  Timer,
  Layers,
  BarChart3,
  Plus,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Logo } from "@repo/ui/components/logo";
import { SINGLE_TEST_PRICE_INR } from "@/lib/pricing";

const TICKER = [
  "Negative marking",
  "Section timing",
  "PYQ tagging",
  "Rank prediction",
  "Weak-spot heatmap",
  "Live leaderboard",
  "Study notes",
  "Assam-focused",
];

const FAQ = [
  {
    q: "Is it free to try?",
    a: "Yes — the first mock in every series and the first study topic in every subject are free forever. All previous-year papers are open to everyone. No card required.",
  },
  {
    q: "Which exams are covered?",
    a: "Assam TET, ADRE and Assam Police today, with APSC and more on the way. Every mock is mapped to the latest official blueprint.",
  },
  {
    q: "How close are the mocks to the real paper?",
    a: "Section timing, negative-marking ratios and question mix follow the actual exam pattern. You practise under the same constraints you'll face on test day.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Porikhya Axom runs in any browser on phone or laptop. Sign up and start your first mock in under a minute.",
  },
  {
    q: "What do I get when I upgrade?",
    a: "Detailed solutions, score-trend and weak-topic analytics, percentile and rank, PYQs with solutions, and every study topic — for the categories your plan covers.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen scroll-smooth bg-background text-foreground">
      <LandingNav />

      <main>
        <Hero />
        <Ticker />
        <SneakPeek />
        <Pricing />
        <Faq />
      </main>

      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ nav */

function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/">
          <Logo className="text-base" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#product" className="transition-colors hover:text-foreground">
            Product
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/signin" />}
            className="hidden sm:inline-flex"
          >
            Sign in
          </Button>
          <Button size="sm" render={<Link href="/signup" />}>
            Get started
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------- hero */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft grid + glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--border) 60%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--border) 60%, transparent) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />

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
    </section>
  );
}

/* --------------------------------------------------------------- ticker */

function Ticker() {
  return (
    <div className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
        {TICKER.map((t) => (
          <span key={t} className="inline-flex items-center gap-2">
            <span className="text-primary/60">+</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ sneak peek */

function SneakPeek() {
  return (
    <section id="product" className="scroll-mt-20 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              001 · A quick look inside
            </p>
            <h2 className="mt-3 font-heading text-4xl tracking-tight sm:text-5xl">
              One quiet workspace.{" "}
              <span className="block text-muted-foreground italic sm:inline">
                Everything you need.
              </span>
            </h2>
          </div>
          <Button variant="outline" size="sm" render={<Link href="/signup" />}>
            Open dashboard
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </div>

        {/* row 1 — dashboard + analysis */}
        <div className="mt-12 grid gap-5 lg:grid-cols-5">
          <DashboardCard />
          <AnalysisCard />
        </div>

        {/* row 2 — exam UI + marks */}
        <div className="mt-5 grid gap-5 lg:grid-cols-5">
          <ExamUiCard />
          <MarksCard />
        </div>
      </div>
    </section>
  );
}

function MockChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
  );
}

function DashboardCard() {
  const mocks = [
    { name: "Assam TET — Paper I", meta: "Mock 01 · Free", free: true },
    { name: "ADRE Grade III", meta: "Mock 04 · Locked", free: false },
    { name: "Assam Police SI", meta: "Mock 02 · Locked", free: false },
  ];
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-muted/40 to-background p-7 lg:col-span-3">
      <div className="flex items-center justify-between">
        <MockChip label="Test series" />
        <ArrowUpRight className="size-4 text-muted-foreground/50" />
      </div>
      <h3 className="mt-6 font-heading text-2xl tracking-tight">
        Mocks that match the real paper.
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Section timing, negative marking and question mix — mapped to the latest
        blueprint. First mock in every series is free.
      </p>
      <div className="mt-6 grid gap-2.5">
        {mocks.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.meta}</p>
            </div>
            {m.free ? (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                Free
              </span>
            ) : (
              <Layers className="size-4 text-muted-foreground/50" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalysisCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-neutral-950 p-7 text-neutral-100 lg:col-span-2">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          <BarChart3 className="size-3" /> Analysis
        </span>
        <ArrowUpRight className="size-4 text-neutral-600" />
      </div>
      <h3 className="mt-6 font-heading text-2xl tracking-tight">
        Every attempt, one honest page.
      </h3>
      <p className="mt-2 text-sm text-neutral-400">
        Score, cutoff and section splits — with the questions that decided your
        rank.
      </p>
      <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-neutral-500">
          <span>APSC mock 07</span>
          <span>82 / 100</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-4xl">82%</span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            Cleared cutoff
          </span>
        </div>
        <div className="mt-4 flex h-16 items-end gap-1.5">
          {[70, 92, 55, 80, 88, 40, 95].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm rounded-t-md bg-primary/70"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExamUiCard() {
  const palette = [
    "answered",
    "answered",
    "current",
    "skipped",
    "answered",
    "unseen",
    "answered",
    "skipped",
    "unseen",
    "answered",
    "unseen",
    "unseen",
  ];
  const tone: Record<string, string> = {
    answered: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    current: "bg-primary text-primary-foreground border-primary",
    skipped: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    unseen: "bg-muted text-muted-foreground border-border",
  };
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-muted/40 to-background p-7 lg:col-span-2">
      <div className="flex items-center justify-between">
        <MockChip label="Live attempt" />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 font-mono text-xs tabular-nums">
          <Timer className="size-3 text-primary" /> 28:14
        </span>
      </div>
      <h3 className="mt-6 font-heading text-2xl tracking-tight">
        A test UI that stays out of the way.
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Clean timer, section jumps, question palette — nothing you don&apos;t
        need on exam day.
      </p>
      <div className="mt-6 rounded-2xl border border-border/70 bg-background/80 p-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Section B · Reasoning
        </p>
        <div className="mt-3 grid grid-cols-6 gap-2">
          {palette.map((s, i) => (
            <div
              key={i}
              className={`flex aspect-square items-center justify-center rounded-lg border text-xs font-medium ${tone[s]}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarksCard() {
  const rows = [
    {
      label: "Correct",
      value: "42",
      text: "text-emerald-600",
      bar: "bg-emerald-500",
      w: "72%",
    },
    {
      label: "Incorrect",
      value: "9",
      text: "text-destructive",
      bar: "bg-destructive",
      w: "16%",
    },
    {
      label: "Skipped",
      value: "7",
      text: "text-muted-foreground",
      bar: "bg-muted-foreground",
      w: "12%",
    },
  ];
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-muted/40 to-background p-7 lg:col-span-3">
      <div className="flex items-center justify-between">
        <MockChip label="Scorecard" />
        <ArrowUpRight className="size-4 text-muted-foreground/50" />
      </div>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-heading text-2xl tracking-tight">
            Marks the moment you submit.
          </h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Raw and net score with negative marking applied — computed
            server-side, never guessed.
          </p>
        </div>
        <div className="shrink-0 rounded-2xl border border-border/70 bg-background/80 px-6 py-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Net score
          </p>
          <p className="mt-1 font-heading text-4xl tracking-tight">
            39<span className="text-lg text-muted-foreground">.25</span>
          </p>
          <p className="text-xs text-muted-foreground">of 50</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="w-20 text-xs text-muted-foreground">{r.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full opacity-70 ${r.bar}`}
                style={{ width: r.w }}
              />
            </div>
            <span className={`w-6 text-right text-sm font-semibold ${r.text}`}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- pricing */

function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "₹0",
      unit: "forever",
      blurb: "Enough to feel the real thing.",
      features: [
        "First mock in every series",
        "All previous-year papers",
        "One study topic per subject",
        "Basic score on submit",
      ],
      cta: "Start free",
      href: "/signup",
      highlight: false,
      note: undefined as string | undefined,
    },
    {
      name: "Category Pass",
      price: "₹249",
      unit: "/ 6 months",
      blurb: "Go deep on one exam — TET, ADRE or Police.",
      features: [
        "Every mock in the category",
        "Detailed solutions + analytics",
        "Percentile, rank & weak-spots",
        "PYQs with solutions",
        "All study topics",
      ],
      cta: "Upgrade now",
      href: "/signup",
      highlight: true,
      note: "Or ₹499 / year — save 33%",
    },
    {
      name: "Super",
      price: "₹1299",
      unit: "/ year",
      blurb: "All three categories, one price.",
      features: [
        "Everything in Category Pass",
        "TET + ADRE + Police",
        "All-Assam leaderboard",
        "Priority support",
      ],
      cta: "Go Super",
      href: "/signup",
      highlight: false,
      note: undefined,
    },
  ];

  return (
    <section id="pricing" className="scroll-mt-20 border-t border-border/60 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            002 · Pricing
          </p>
          <h2 className="mt-3 font-heading text-4xl tracking-tight sm:text-5xl">
            Simple plans.{" "}
            <span className="text-muted-foreground italic">
              One honest price.
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Try free first. Or unlock a single exam for just ₹
            {SINGLE_TEST_PRICE_INR}. Upgrade only when you&apos;re ready.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-5 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={
                t.highlight
                  ? "relative overflow-hidden rounded-3xl border-2 border-primary bg-gradient-to-b from-primary/[0.06] to-background p-8 shadow-primary lg:-mt-4 lg:pb-10"
                  : "relative overflow-hidden rounded-3xl border border-border bg-background p-8"
              }
            >
              {t.highlight && (
                <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                  <Sparkles className="size-3" /> Most popular
                </span>
              )}
              <p className="text-sm font-medium text-muted-foreground">
                {t.name}
              </p>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-heading text-5xl tracking-tight">
                  {t.price}
                </span>
                <span className="text-sm text-muted-foreground">{t.unit}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>

              <Button
                variant={t.highlight ? "default" : "outline"}
                size="lg"
                className="mt-6 w-full"
                render={<Link href={t.href} />}
              >
                {t.cta}
                <ArrowRight data-icon="inline-end" />
              </Button>
              {t.note && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {t.note}
                </p>
              )}

              <ul className="mt-7 space-y-3 border-t border-border/60 pt-6 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Plans stack — hold TET and Police at once. Cancel anytime, no card
          required for the free tier.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ faq */

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-border/60 py-28">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            003 · FAQ
          </p>
          <h2 className="mt-3 font-heading text-4xl tracking-tight sm:text-5xl">
            Answers, quietly.
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQ.map((item, i) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border bg-background px-5 py-4 open:bg-muted/30 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 text-sm font-medium">
                <span className="font-mono text-xs text-muted-foreground/60">
                  0{i + 1}
                </span>
                <span className="flex-1">{item.q}</span>
                <Plus className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 pl-8 pr-8 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- footer */

function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "Test series", href: "/signup" },
        { label: "Previous-year papers", href: "/previous-year-papers" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Sign in", href: "/signin" },
        { label: "Sign up", href: "/signup" },
        { label: "Dashboard", href: "/dashboard" },
      ],
    },
  ];
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Logo className="text-base" />
            <p className="mt-4 text-sm text-muted-foreground">
              Mocks, notes and honest analytics for Assam&apos;s competitive
              exams.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              render={<Link href="/signup" />}
            >
              Start free
              <ArrowUpRight data-icon="inline-end" />
            </Button>
          </div>
          <div className="flex gap-16">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/60">
                  {c.title}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            All systems calm · Guwahati
          </span>
          <span>© 2026 Porikhya Axom</span>
        </div>
      </div>
    </footer>
  );
}
