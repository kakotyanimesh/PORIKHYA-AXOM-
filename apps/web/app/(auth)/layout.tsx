import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { Logo } from "@repo/ui/components/logo";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");

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
