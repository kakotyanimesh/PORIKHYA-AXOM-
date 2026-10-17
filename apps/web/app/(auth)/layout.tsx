import Link from "next/link";
import { Logo } from "@repo/ui/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex justify-center p-6">
        <Link href="/">
          <Logo className="text-base" />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        {children}
      </main>
    </div>
  );
}
