import { Plus } from "lucide-react";

const FAQ = [
  {
    q: "Is it free to try?",
    a: "Yes — the first mock in every series and the first study topic in every subject are free forever. All previous-year papers are open to everyone. No card required.",
  },
  {
    q: "Which exams are covered?",
    a: "Assam TET, ADRE and Assam Police today, with APSC and more on the way. Every mock is mapped to the latest official blueprint.",
  },
  {
    q: "How close are the mocks to the real paper?",
    a: "Section timing, negative-marking ratios and question mix follow the actual exam pattern. You practise under the same constraints you'll face on test day.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Porikhya Axom runs in any browser on phone or laptop. Sign up and start your first mock in under a minute.",
  },
  {
    q: "What do I get when I upgrade?",
    a: "Detailed solutions, score-trend and weak-topic analytics, percentile and rank, PYQs with solutions, and every study topic — for the categories your plan covers.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-border/50 py-28">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-left">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-brand-accent">005</span> · FAQ
          </p>
          <h2 className="mt-3 font-heading text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
            Answers, quietly.
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQ.map((item, i) => (
            <details
              key={item.q}
              className="faq-item group rounded-2xl border border-border/60 bg-background px-5 py-4 transition-colors open:bg-muted/30 hover:border-border [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 text-sm font-medium">
                <span className="font-mono text-xs text-muted-foreground/60">
                  0{i + 1}
                </span>
                <span className="flex-1">{item.q}</span>
                <Plus className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-open:rotate-45" />
              </summary>
              <p className="mt-3 pl-8 pr-8 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
