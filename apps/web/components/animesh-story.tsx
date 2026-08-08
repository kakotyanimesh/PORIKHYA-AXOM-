"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowLeft,
  HeartHandshake,
  MapPin,
  Scale,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import { Logo } from "@repo/ui/components/logo";
import { Footer } from "@/components/landingpage/footer";

type Lang = "en" | "as";

const LANGS = [
  { id: "en", label: "EN" },
  { id: "as", label: "অসমীয়া" },
] as const;

function LanguageToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    // Floating: bottom-centre on phones (thumb reach), top-right on larger
    // screens. Blurred solid background so it stays readable over scrolling
    // content.
    <div className="fixed inset-x-0 bottom-5 z-50 mx-auto flex w-fit sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-6 sm:mx-0">
      <div className="relative grid grid-cols-2 rounded-full border bg-background/80 p-0.5 shadow-sm backdrop-blur">
        {/* The fill is one absolutely-positioned pill that slides between the two
            halves via left/right insets. No layout projection, so it is immune
            to the position:fixed + scroll offset bug that made it fly in. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0.5 rounded-full bg-primary transition-[left,right] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={
            lang === "en"
              ? { left: "0.125rem", right: "50%" }
              : { left: "50%", right: "0.125rem" }
          }
        />
        {LANGS.map((l) => {
          const active = lang === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onChange(l.id)}
              aria-pressed={active}
              className={cn(
                "relative z-10 rounded-full px-3.5 py-1.5 text-center text-sm outline-none transition-colors",
                active
                  ? "font-medium text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {l.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// All page copy lives here as en/as pairs. Edit freely; nothing is generated at
// runtime. Kept comma/period phrasing (no em-dashes) per the brand voice.
const COPY = {
  en: {
    backHome: "Back home",
    eyebrows: {
      story: "The story",
      stands: "What it stands for",
      behind: "Who's behind it",
      built: "How it's built",
    },
    heroTitlePre: "I was tired of prep that ",
    heroTitleEm: "lied",
    heroTitlePost: " to students.",
    heroBody:
      "PorikhyaAxom is a mock-test platform for Assam's competitive exams. It exists for one reason. Aspirants here deserve practice that mirrors the real paper, and a score they can actually trust.",
    narrative: [
      "Most 'mock tests' for Assam exams are photocopied PDFs, or apps that hand out inflated marks so you feel good and come back. That gap between the score on the screen and the score on result day is where dreams quietly break.",
      "So I started building the thing I wished existed. Timed tests with negative marking, questions mapped to the real blueprint, and results that show you the truth instead of a confidence trick. If you are going to spend a year of your life on APSC or TET, your practice should respect that.",
    ],
    behindName: "Animesh Kakoty",
    behindBody:
      "I am a developer from Assam, building PorikhyaAxom mostly on my own. Design, code, questions, all of it. I grew up around people preparing for these exams, so this is not a market I read about in a pitch deck. It is home. My one rule for the product is simple. Never lie to a student about where they stand.",
    builtTitle: "One human, paired with Claude Code",
    builtBody: [
      "I will be honest about this too. I did not build PorikhyaAxom entirely alone. I built it alongside Claude Code, Anthropic's AI coding agent, as my pair-programmer. From the database and secure sign-in to the payments flow, the anti-cheat logic, and much of the interface polish, we designed and wrote it together, one decision at a time.",
      "Every choice still went through me. But the pace, the quality, and honestly the courage to ship a platform this ambitious on my own, a big part of that is Claude. It felt less like using a tool and more like working with a very fast, very patient teammate. Credit where it is due. ",
    ],
    ctaTitle: "Practice like it is the real thing.",
    ctaBody:
      "Free to start. No card, no fake scores. Just the paper, honestly.",
    startFree: "Start free",
  },
  as: {
    backHome: "ঘৰলৈ উভতি যাওক",
    eyebrows: {
      story: "কাহিনী",
      stands: "ই কিহৰ বাবে থিয় দিয়ে",
      behind: "ইয়াৰ পিছফালে কোন",
      built: "ই কেনেকৈ সজা হ'ল",
    },
    heroTitlePre: "শিক্ষাৰ্থীক ",
    heroTitleEm: "মিছা কোৱা",
    heroTitlePost: " প্ৰস্তুতিত মই আমনি পাইছিলোঁ।",
    heroBody:
      "পৰীক্ষা অসম হৈছে অসমৰ প্ৰতিযোগিতামূলক পৰীক্ষাৰ বাবে এটা মক টেষ্ট প্লেটফৰ্ম। ই এটা কাৰণতে আছে। ইয়াৰ পৰীক্ষাৰ্থীসকলে প্ৰকৃত প্ৰশ্নকাকতৰ দৰেই অনুশীলন, আৰু বিশ্বাস কৰিব পৰা এটা নম্বৰৰ যোগ্য।",
    narrative: [
      "অসমৰ পৰীক্ষাৰ বেছিভাগ 'মক টেষ্ট' হৈছে ফটোকপি কৰা পিডিএফ, বা এনে এপ যিয়ে ভাল লগাবলৈ ফুলাই নম্বৰ দিয়ে যাতে আপুনি ঘূৰি আহে। স্ক্ৰীণৰ নম্বৰ আৰু ফলাফলৰ দিনাৰ নম্বৰৰ মাজৰ এই ব্যৱধানতেই সপোনবোৰ নীৰৱে ভাঙি যায়।",
      "সেয়েহে মই বিচৰা বস্তুটো নিজে সাজিবলৈ ল'লোঁ। নেগেটিভ মাৰ্কিংসহ সময়বদ্ধ পৰীক্ষা, প্ৰকৃত ব্লুপ্ৰিন্ট অনুসৰি সজোৱা প্ৰশ্ন, আৰু আত্মবিশ্বাসৰ ছল নিদি সত্যটো দেখুওৱা ফলাফল। যদি আপুনি APSC বা TET ৰ বাবে জীৱনৰ এটা বছৰ দিব, আপোনাৰ অনুশীলনে সেয়া সন্মান কৰা উচিত।",
    ],
    behindName: "অনিমেষ কাকতি",
    behindBody:
      "মই অসমৰ এজন ডেভেলপাৰ, পৰীক্ষা অসম বেছিভাগেই নিজে সাজি আছোঁ। ডিজাইন, ক'ড, প্ৰশ্ন, সকলোবোৰ। মই এনে মানুহৰ মাজত ডাঙৰ হৈছোঁ যিসকলে এই পৰীক্ষাবোৰৰ বাবে প্ৰস্তুতি চলাইছিল, গতিকে এইটো কোনো পিচ ডেকত পঢ়া বজাৰ নহয়। এইটো ঘৰ। প্ৰডাক্টৰ বাবে মোৰ এটাই নিয়ম। শিক্ষাৰ্থীক তেওঁ ক'ত আছে সেই বিষয়ে কেতিয়াও মিছা নক'ম।",
    builtTitle: "এজন মানুহ, Claude Code ৰ সৈতে",
    builtBody: [
      "এইটোৰ বিষয়েও মই সৎ হ'ম। পৰীক্ষা অসম মই সম্পূৰ্ণ অকলে সজা নাই। মই ইয়াক Claude Code, Anthropic ৰ AI কোডিং এজেণ্টৰ সৈতে, মোৰ পেয়াৰ-প্ৰগ্ৰেমাৰ হিচাপে সাজিছোঁ। ডাটাবেছ আৰু সুৰক্ষিত ছাইন-ইনৰ পৰা পেমেণ্ট ফ্ল', এণ্টি-চিট লজিক, আৰু ইণ্টাৰফেছৰ বহুখিনি পালিচ, আমি একেলগে এটা এটাকৈ সিদ্ধান্ত লৈ ডিজাইন আৰু লিখিছোঁ।",
      "প্ৰতিটো সিদ্ধান্ত এতিয়াও মোৰ মাজেৰেই গৈছে। কিন্তু গতি, মান, আৰু সঁচাকৈ ইমান উচ্চাভিলাষী প্লেটফৰ্ম এখন অকলে মুকলি কৰাৰ সাহস, তাৰ বৰ ডাঙৰ অংশ Claude ৰ। ই এটা সঁজুলি ব্যৱহাৰতকৈ বেছি এজন অতি দ্ৰুত, অতি ধৈৰ্য্যশীল সহকৰ্মীৰ সৈতে কাম কৰাৰ দৰে লাগিছিল। প্ৰাপ্য সন্মান দিছোঁ। ",
    ],
    ctaTitle: "প্ৰকৃত পৰীক্ষাৰ দৰেই অনুশীলন কৰক।",
    ctaBody:
      "বিনামূলীয়াকৈ আৰম্ভ। কোনো কাৰ্ড নাই, কোনো মিছা নম্বৰ নাই। কেৱল প্ৰশ্নকাকত, সততাৰে।",
    startFree: "বিনামূলীয়াকৈ আৰম্ভ কৰক",
  },
} satisfies Record<Lang, unknown>;

const PRINCIPLES = [
  {
    icon: HeartHandshake,
    en: {
      title: "Honest analytics",
      body: "No vanity scores. Your result shows exactly where you stand. Negative marking, section splits, the real percentile. The number you would get on exam day, not a feel-good one.",
    },
    as: {
      title: "সৎ বিশ্লেষণ",
      body: "কোনো ভুৱা নম্বৰ নাই। আপোনাৰ ফলাফলে আপুনি ঠিক ক'ত আছে দেখুৱায়। নেগেটিভ মাৰ্কিং, ছেকচন অনুসৰি ভাগ, প্ৰকৃত পাৰচেণ্টাইল। পৰীক্ষাৰ দিনা পোৱা নম্বৰটো, ভাল লগোৱা নম্বৰ নহয়।",
    },
  },
  {
    icon: MapPin,
    en: {
      title: "Assam-first",
      body: "Built around Assam TET, SI, APSC and ADRE. The blueprints, the Assam-specific GK, the language. Not a national product with Assam bolted on.",
    },
    as: {
      title: "অসম প্ৰথম",
      body: "অসম TET, SI, APSC আৰু ADRE ৰ চাৰিওফালে সজা। ব্লুপ্ৰিন্ট, অসম-কেন্দ্ৰিক সাধাৰণ জ্ঞান, ভাষা। অসম লগাই দিয়া কোনো ৰাষ্ট্ৰীয় প্ৰডাক্ট নহয়।",
    },
  },
  {
    icon: Scale,
    en: {
      title: "Fair pricing",
      body: "A free tier that is actually usable, a flat ₹50 to unlock a single test, and category bundles when you want more. No dark patterns, no auto-renew traps.",
    },
    as: {
      title: "ন্যায্য মূল্য",
      body: "সঁচাকৈ ব্যৱহাৰযোগ্য এটা বিনামূলীয়া স্তৰ, এটা টেষ্ট খোলিবলৈ মাথোঁ ₹৫০, আৰু অধিক লাগিলে কেটেগৰি বাণ্ডল। কোনো ছল নাই, কোনো অটো-ৰিনিউৰ ফান্দ নাই।",
    },
  },
];

const TRIVIA = [
  {
    en: { k: "Started in", v: "Majuli, Assam" },
    as: { k: "আৰম্ভ হ'ল", v: "মাজুলী, অসম" },
  },
  {
    en: { k: "Built by", v: "1 dev + Claude Code" },
    as: { k: "সাজিলে", v: "১ জন ডেভ + Claude Code" },
  },
  {
    en: { k: "Exams live", v: "TET · SI · ADRE" },
    as: { k: "চলিত পৰীক্ষা", v: "TET · SI · ADRE" },
  },
  {
    en: { k: "Promise", v: "No fake scores" },
    as: { k: "প্ৰতিশ্ৰুতি", v: "কোনো মিছা নম্বৰ নাই" },
  },
];

export function AnimeshStory() {
  const [lang, setLang] = useState<Lang>("en");
  const t = COPY[lang];

  return (
    <div className="flex min-h-svh flex-col pb-20 sm:pb-0">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/">
          <Logo className="text-base" />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/" />}
          className="text-muted-foreground"
        >
          <ArrowLeft data-icon="inline-start" />
          {t.backHome}
        </Button>
      </header>

      <LanguageToggle lang={lang} onChange={setLang} />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="text-brand-accent">00</span> · {t.eyebrows.story}
            </p>
            <h1 className="mt-4 font-heading text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
              {t.heroTitlePre}
              <span className="text-muted-foreground italic">
                {t.heroTitleEm}
              </span>
              {t.heroTitlePost}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {t.heroBody}
            </p>
          </div>
        </section>

        {/* Narrative */}
        <section className="pb-4">
          <div className="mx-auto max-w-3xl px-6">
            <div className="reveal space-y-6 text-base leading-relaxed text-foreground/90">
              {t.narrative.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="text-brand-accent">01</span> ·{" "}
              {t.eyebrows.stands}
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {PRINCIPLES.map((p, i) => {
                const Icon = p.icon;
                const c = p[lang];
                return (
                  <div
                    key={p.en.title}
                    style={{ "--reveal-i": i } as React.CSSProperties}
                    className="reveal landing-card rounded-3xl border border-border/60 bg-gradient-to-b from-muted/40 to-background p-6 transition-transform duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-1"
                  >
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-heading text-lg tracking-[-0.01em]">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {c.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Who's behind it */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="text-brand-accent">02</span> ·{" "}
              {t.eyebrows.behind}
            </p>
            <div className="reveal mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground font-dottedFont">
                PA
              </span>
              <div>
                <h2 className="font-heading text-2xl tracking-[-0.02em]">
                  {t.behindName}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {t.behindBody}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it's built */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="text-brand-accent">03</span> · {t.eyebrows.built}
            </p>
            <div className="reveal landing-card mt-8 rounded-3xl border border-border/60 bg-gradient-to-b from-muted/40 to-background p-7">
              <h3 className="font-heading text-xl tracking-[-0.015em]">
                {t.builtTitle}
              </h3>
              {t.builtBody.map((para, i) => (
                <p
                  key={para.slice(0, 24)}
                  className={
                    i === 0
                      ? "mt-3 text-base leading-relaxed text-muted-foreground"
                      : "mt-4 text-base leading-relaxed text-muted-foreground"
                  }
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Trivia */}
        <section className="py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border/60 bg-border/60 sm:grid-cols-4">
              {TRIVIA.map((item, i) => {
                const c = item[lang];
                return (
                  <div
                    key={item.en.k}
                    style={{ "--reveal-i": i } as React.CSSProperties}
                    className="reveal bg-background p-6"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground/60">
                      {c.k}
                    </p>
                    <p className="mt-2 font-heading text-lg tracking-[-0.01em]">
                      {c.v}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] tracking-[-0.025em] sm:text-4xl">
              {t.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              {t.ctaBody}
            </p>
            <Button className="mt-8" render={<Link href="/signup" />}>
              {t.startFree}
              <ArrowUpRight data-icon="inline-end" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
