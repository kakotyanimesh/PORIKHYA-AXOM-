import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Logo } from "@repo/ui/components/logo";

export function Footer() {
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
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Logo className="text-base" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
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

        <div className="mt-14 flex flex-col gap-3 border-t border-border/50 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
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
