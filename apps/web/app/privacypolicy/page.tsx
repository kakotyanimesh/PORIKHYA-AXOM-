import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Logo } from "@repo/ui/components/logo";
import { Footer } from "@/components/landingpage/footer";

export const metadata: Metadata = {
  title: "Terms & Privacy Policy · পৰীক্ষা অসম",
  description:
    "The terms of use and privacy policy for PorikhyaAxom — how the platform works, payments, refunds, and how your data is handled.",
};

const CONTACT = "animeshkakoty07@gmail.com";
const EFFECTIVE = "8 August 2026";

type Section = { id: string; heading: string; body: React.ReactNode };

const TERMS: Section[] = [
  {
    id: "acceptance",
    heading: "1. Acceptance",
    body: (
      <p>
        PorikhyaAxom is operated by Animesh Kakoty, an individual based in
        Assam, India. By creating an account or using the platform, you agree to
        these Terms and to the Privacy Policy below. If you do not agree, do not
        use the platform.
      </p>
    ),
  },
  {
    id: "eligibility",
    heading: "2. Eligibility",
    body: (
      <p>
        The platform is intended for users aged 18 or older. If you are between
        13 and 18, you may use it only with the consent and supervision of a
        parent or legal guardian, who accepts these Terms on your behalf. We do
        not knowingly allow use by anyone under 13.
      </p>
    ),
  },
  {
    id: "accounts",
    heading: "3. Your account",
    body: (
      <>
        <p>
          You must provide accurate information (name, email, phone number) and
          keep your login credentials secure. You are responsible for all
          activity under your account. One person, one account.
        </p>
        <p>
          Keep your email address and phone number accurate. We may suspend or
          close accounts that provide false information or are used to abuse
          the platform.
        </p>
      </>
    ),
  },
  {
    id: "attempts",
    heading: "4. Tests and attempts",
    body: (
      <p>
        Each exam allows a single attempt, locked when the attempt starts. If
        you close the tab, lose connection, or abandon a test mid-way, that
        attempt is used up — there is no resume and no retry. This mirrors real
        exam conditions and is by design. Scores are computed on the server when
        you submit.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    heading: "5. Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>
            copy, scrape, record, resell, or redistribute questions, answers, or
            any platform content;
          </li>
          <li>
            share your account, or use automated tools, bots, or scripts to
            access the platform;
          </li>
          <li>
            attempt to bypass payment, access controls, or the single-attempt
            lock; or
          </li>
          <li>disrupt, probe, or overload the service.</li>
        </ul>
      </>
    ),
  },
  {
    id: "payments",
    heading: "6. Payments",
    body: (
      <>
        <p>
          Some content is free; the rest is unlocked by a one-time per-exam
          payment or a time-boxed subscription plan. All prices are in Indian
          Rupees (INR) and, unless stated otherwise, are inclusive of applicable
          taxes. Payments are processed by Razorpay; we do not store your card
          or bank details.
        </p>
        <p>
          Subscription plans grant access to the exams in the purchased
          categories for their stated duration and do not auto-renew unless
          clearly stated at checkout.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    heading: "7. Refunds",
    body: (
      <p>
        All purchases are final. Once a test or plan is unlocked on your
        account, fees are non-refundable, except where a refund is required by
        applicable law or in the case of a duplicate or failed charge where
        access was not delivered. To raise a genuine billing issue, contact us
        at {CONTACT}.
      </p>
    ),
  },
  {
    id: "ip",
    heading: "8. Intellectual property",
    body: (
      <p>
        All content on the platform — questions, solutions, notes, design, and
        code — is owned by us or our licensors and is protected by law. Your
        purchase grants you a personal, non-transferable right to access the
        content for your own exam preparation only.
      </p>
    ),
  },
  {
    id: "disclaimer",
    heading: "9. Disclaimer & no affiliation",
    body: (
      <p>
        PorikhyaAxom is an independent preparation platform. We are
        <strong className="px-1">
          not affiliated with, endorsed by, or connected to
        </strong>
        APSC, SEBA, the Assam Police, the Government of Assam, or any official
        examination authority. Exam names are used only to describe the exams we
        help you prepare for. We do not guarantee any particular result, rank,
        or that our content matches every future exam pattern. Content is
        provided &ldquo;as is&rdquo; for practice.
      </p>
    ),
  },
  {
    id: "liability",
    heading: "10. Limitation of liability",
    body: (
      <p>
        To the maximum extent permitted by law, we are not liable for any
        indirect or consequential loss, or for any loss arising from exam
        outcomes, content errors, or service interruptions. Our total liability
        for any claim is limited to the amount you paid us in the twelve months
        before the claim.
      </p>
    ),
  },
  {
    id: "termination",
    heading: "11. Suspension & termination",
    body: (
      <p>
        We may suspend or terminate access if you breach these Terms. You may
        stop using the platform and delete your account at any time from your
        account settings.
      </p>
    ),
  },
  {
    id: "law",
    heading: "12. Governing law",
    body: (
      <p>
        These Terms are governed by the laws of India. Any dispute is subject to
        the exclusive jurisdiction of the courts at Guwahati, Assam.
      </p>
    ),
  },
];

const PRIVACY: Section[] = [
  {
    id: "controller",
    heading: "1. Who handles your data",
    body: (
      <p>
        Your data is controlled by Animesh Kakoty (Assam, India), operator of
        PorikhyaAxom. For any privacy question, correction, or grievance,
        contact {CONTACT}.
      </p>
    ),
  },
  {
    id: "collect",
    heading: "2. What we collect",
    body: (
      <ul>
        <li>
          <strong>Account details</strong> — name, username, email address, and
          phone number.
        </li>
        <li>
          <strong>Credentials</strong> — your password is stored only as a
          secure hash; we never see it in plain text.
        </li>
        <li>
          <strong>Usage data</strong> — the exams you attempt and your scores.
        </li>
        <li>
          <strong>Technical data</strong> — IP address and browser/user-agent,
          tied to your login sessions for security.
        </li>
        <li>
          <strong>Payment metadata</strong> — order and payment references from
          Razorpay. We do not store your card, UPI, or bank details.
        </li>
      </ul>
    ),
  },
  {
    id: "use",
    heading: "3. How we use it",
    body: (
      <p>
        To run your account and authentication, deliver and score tests, process
        payments and grant access, keep the service secure (including rate
        limiting and abuse prevention), and send you essential transactional
        email such as email verification. We do not sell your personal data.
      </p>
    ),
  },
  // {
  //   id: "processors",
  //   heading: "4. Service providers",
  //   body: (
  //     <>
  //       <p>
  //         We share the minimum data needed with trusted providers who process it
  //         on our behalf:
  //       </p>
  //       <ul>
  //         <li>
  //           <strong>Supabase</strong> — database hosting.
  //         </li>
  //         <li>
  //           <strong>Razorpay</strong> — payment processing.
  //         </li>
  //         <li>
  //           <strong>Resend</strong> — sending transactional email.
  //         </li>
  //         <li>
  //           <strong>Google</strong> — only if you choose to sign in with Google.
  //         </li>
  //       </ul>
  //     </>
  //   ),
  // },
  {
    id: "cookies",
    heading: "4. Cookies",
    body: (
      <p>
        We use only essential cookies required to keep you signed in and to
        secure your session. We do not use third-party advertising or tracking
        cookies.
      </p>
    ),
  },
  {
    id: "retention",
    heading: "5. Retention",
    body: (
      <p>
        We keep your data for as long as your account is active. Payment records
        are retained as long as needed to meet legal and accounting obligations.
        When you delete your account, your personal data is removed, except
        records we must keep by law.
      </p>
    ),
  },
  {
    id: "rights",
    heading: "6. Your rights",
    body: (
      <p>
        You can access and correct your account details from your settings, and
        delete your account at any time. To request a copy of your data or raise
        a concern, email {CONTACT} and we will respond within a reasonable time.
      </p>
    ),
  },
  {
    id: "security",
    heading: "7. Security",
    body: (
      <p>
        Passwords are hashed, sessions are protected, and sensitive auth routes
        are rate-limited. No system is perfectly secure, but we take reasonable
        measures to protect your data and will act promptly on any breach that
        affects you.
      </p>
    ),
  },
  {
    id: "children",
    heading: "8. Children",
    body: (
      <p>
        The platform is not directed at children under 13, and we do not
        knowingly collect their data. Users under 18 must use it under a parent
        or guardian&apos;s consent.
      </p>
    ),
  },
];

function SectionList({ items }: { items: Section[] }) {
  return (
    <div className="space-y-10">
      {items.map((s) => (
        <div key={s.id} id={s.id} className="scroll-mt-24">
          <h3 className="font-heading text-xl tracking-[-0.015em]">
            {s.heading}
          </h3>
          <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_li]:ml-1 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
            {s.body}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="transition-opacity hover:opacity-70">
          <Logo className="text-base" />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/" />}
          className="text-muted-foreground"
        >
          <ArrowLeft data-icon="inline-start" />
          Back home
        </Button>
      </header>

      <main className="flex-1">
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="text-brand-accent">Legal</span> · Effective{" "}
              {EFFECTIVE}
            </p>
            <h1 className="mt-4 font-heading text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
              Terms &amp; Privacy Policy
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              The rules for using PorikhyaAxom and how we handle your data.
              Please read both parts. Questions? Email{" "}
              <a href={`mailto:${CONTACT}`} className="text-primary underline">
                {CONTACT}
              </a>
              .
            </p>
          </div>
        </section>

        <section className="pb-8">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-heading text-2xl tracking-[-0.02em]">
              Terms of Use
            </h2>
            <div className="mt-8">
              <SectionList items={TERMS} />
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-3xl px-6">
            <div className="border-t border-border/60 pt-12">
              <h2 className="font-heading text-2xl tracking-[-0.02em]">
                Privacy Policy
              </h2>
              <div className="mt-8">
                <SectionList items={PRIVACY} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
