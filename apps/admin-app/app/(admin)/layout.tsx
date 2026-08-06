import Link from "next/link";
import { requireAdmin } from "@/lib/utils/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link href="/" className="font-heading text-lg font-medium">
          porikhyaaxom admin
        </Link>
        <span className="text-sm text-muted-foreground">{admin.email}</span>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
