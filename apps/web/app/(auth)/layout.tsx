import { Navbar } from "@/components/navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center p-6">
        {children}
      </main>
    </>
  );
}
