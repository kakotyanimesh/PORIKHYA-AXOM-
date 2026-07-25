import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Logo } from "@repo/ui/components/logo";

export function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/">
        <Logo className="text-lg" />
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
        <Link href="/previous-year-papers" className="hover:text-foreground">
          Previous Year Papers
        </Link>
        <Link href="/pricing" className="hover:text-foreground">
          Pricing
        </Link>
      </nav>
      <div className="flex items-center gap-2">
        <Button variant="ghost" render={<Link href="/signin" />}>
          Sign in
        </Button>
        <Button render={<Link href="/signup" />}>
          Get started
          <ArrowUpRight data-icon="inline-end" />
        </Button>
      </div>
    </header>
  );
}
