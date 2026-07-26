// no fixed height/overflow here — the attempt page's own root manages its
// h-dvh overflow-hidden fullscreen shell; a result (or any other) page under
// /exams needs normal document scroll instead
export default function ExamsLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh w-full bg-background">{children}</div>;
}
