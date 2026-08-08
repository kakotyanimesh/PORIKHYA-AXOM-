import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPublicPyqPapers } from "@/lib/actions/previous-year-papers.action";
import { catMeta, CATEGORY_ORDER } from "@/components/subscriptions/category-meta";
import { Badge } from "@repo/ui/components/badge";

export const metadata: Metadata = {
  title:
    "Previous Year Question Papers — Assam TET, Police, APSC, ADRE | পৰীক্ষা অসম",
  description:
    "Solved previous year question papers for Assam's competitive exams — Assam TET, Assam Police SI, APSC, ADRE — with correct answers and explanations. Free to read.",
  alternates: { canonical: "/previous-year-papers" },
  openGraph: {
    type: "website",
    url: "/previous-year-papers",
    title: "Previous Year Question Papers for Assam Competitive Exams",
    description:
      "Solved PYQ papers for Assam TET, Police, APSC and ADRE — answers and explanations, free to read.",
  },
};

function orderCategory(a: string, b: string): number {
  const ia = CATEGORY_ORDER.indexOf(a);
  const ib = CATEGORY_ORDER.indexOf(b);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
}

export default async function PreviousYearPapersPage() {
  const papers = await getPublicPyqPapers();

  // group by category — papers already ordered year desc, name asc
  const byCategory = new Map<string, typeof papers>();
  for (const p of papers) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }
  const categories = [...byCategory.keys()].sort(orderCategory);

  return (
    <div className="content-enter">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Previous Year Papers
        </p>
        <h1 className="mt-2 font-heading text-3xl tracking-[-0.02em] sm:text-4xl">
          Every past paper,{" "}
          <span className="text-muted-foreground italic">solved.</span>
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Actual previous-year questions from Assam TET, Assam Police, APSC and
          ADRE — each with the correct answer and a worked explanation. Free to
          read, no sign-in needed.
        </p>
      </header>

      {categories.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No previous year papers published yet. Check back soon.
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {categories.map((category) => {
            const meta = catMeta(category);
            const list = byCategory.get(category)!;
            return (
              <section key={category}>
                <div className="flex items-baseline justify-between">
                  <h2 className="font-heading text-xl">{meta.label}</h2>
                  <span className="text-xs tracking-wide text-muted-foreground uppercase">
                    {list.length} {list.length === 1 ? "paper" : "papers"}
                  </span>
                </div>

                <ul className="mt-4 divide-y divide-border rounded-2xl border">
                  {list.map((paper) => (
                    <li key={paper.id}>
                      <Link
                        href={`/previous-year-papers/${paper.slug}`}
                        className="group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-base font-medium">
                            {paper.name}
                          </span>
                          <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                            {paper.subject}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          {paper.year ? (
                            <Badge variant="secondary">{paper.year}</Badge>
                          ) : null}
                          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
