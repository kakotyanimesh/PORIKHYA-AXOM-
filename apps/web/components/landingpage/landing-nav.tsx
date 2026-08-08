import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Logo } from "@repo/ui/components/logo";

export function LandingNav() {
  return (
    <header className="landing-nav fixed inset-x-0 top-0 z-50 bg-background/95 sm:bg-background/70 sm:backdrop-blur-xl sm:backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/">
          <Logo className="text-base" />
        </Link>
        <nav className="hidden items-center gap-9 text-sm text-muted-foreground md:flex">
          <a
            href="#product"
            className="transition-colors hover:text-foreground"
          >
            Product
          </a>
          <a
            href="#pricing"
            className="transition-colors hover:text-foreground"
          >
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
