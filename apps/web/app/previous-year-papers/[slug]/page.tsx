import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon } from "lucide-react";
import {
  getPyqPaperBySlug,
  getPublicPyqSlugs,
  type PyqPaper,
} from "@/lib/actions/previous-year-papers.action";
import { catMeta } from "@/components/subscriptions/category-meta";
import { SITE_URL } from "@/lib/site";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";

// prerender every published paper at build time — static HTML for crawlers,
// instant navigation for users. Papers added later render on-demand then cache.
export async function generateStaticParams() {
  const slugs = await getPublicPyqSlugs();
  return slugs.map((slug) => ({ slug }));
}

function paperTitle(paper: PyqPaper): string {
  const year = paper.year ? ` (${paper.year})` : "";
  return `${paper.name} — Previous Year Question Paper${year}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paper = await getPyqPaperBySlug(slug);
  if (!paper) return { title: "Paper not found" };

  const label = catMeta(paper.category).label;
  const description = `Solved ${label} previous year question paper${
    paper.year ? ` from ${paper.year}` : ""
  } — ${paper.questions.length} questions with correct answers and explanations. ${paper.subject}. Free to read on পৰীক্ষা অসম.`;
  const url = `/previous-year-papers/${slug}`;

  return {
    title: paperTitle(paper),
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: paperTitle(paper), description },
  };
}

// schema.org structured data so the Q&A is eligible for rich results.
function quizJsonLd(paper: PyqPaper, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: paperTitle(paper),
    url: `${SITE_URL}/previous-year-papers/${slug}`,
    about: { "@type": "Thing", name: catMeta(paper.category).label },
    hasPart: paper.questions.map((q) => {
      const correct = q.options.find((o) => o.is_correct);
      return {
        "@type": "Question",
        text: q.content,
        acceptedAnswer: correct
          ? {
              "@type": "Answer",
              text: [correct.text, q.solution_text].filter(Boolean).join(" — "),
            }
          : undefined,
      };
    }),
  };
}

export default async function PreviousYearPaperPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const paper = await getPyqPaperBySlug(slug);
  if (!paper) notFound();

  const label = catMeta(paper.category).label;

  return (
    <article className="content-enter">
      {/* JSON-LD is data, not shown — dangerouslySetInnerHTML is the standard,
          safe way to embed it (schema.org script, not user HTML). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(quizJsonLd(paper, slug)),
        }}
      />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/previous-year-papers" />}>
              Previous Year Papers
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[16rem] truncate font-medium">
              {paper.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mt-6">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
          {paper.year ? ` · ${paper.year}` : ""}
        </p>
        <h1 className="mt-2 text-3xl tracking-[-0.02em] sm:text-4xl">
          {paper.name}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {paper.subject} · {paper.questions.length} questions with solutions
        </p>
      </header>

      <div className="my-8 h-px bg-border" />

      {paper.questions.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Questions for this paper are being added.
        </p>
      ) : (
        <ol className="space-y-8">
          {paper.questions.map((q, i) => (
            <li key={q.id} id={`q${i + 1}`} className="scroll-mt-20">
              <div className="flex gap-3">
                <span className="mt-1 shrink-0 text-base text-muted-foreground tabular-nums">
                  {i + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-lg leading-relaxed font-medium">
                    {q.content}
                  </p>
                  {q.content_assamese ? (
                    <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
                      {q.content_assamese}
                    </p>
                  ) : null}

                  <ul className="mt-3 space-y-1.5">
                    {q.options.map((o) => (
                      <li
                        key={o.id}
                        className={
                          o.is_correct
                            ? "flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2.5 text-base"
                            : "flex items-start gap-2.5 rounded-xl border border-transparent px-3.5 py-2.5 text-base text-muted-foreground"
                        }
                      >
                        {o.is_correct ? (
                          <CheckIcon className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                        ) : (
                          <span className="mt-0.5 size-5 shrink-0" />
                        )}
                        <span>
                          {o.text}
                          {o.text_assamese ? (
                            <span className="mt-0.5 block text-sm text-muted-foreground">
                              {o.text_assamese}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {q.solution_text ? (
                    // native <details> — content stays in the DOM (crawlable)
                    // whether open or closed, no JS. Radix Collapsible would
                    // unmount it and hide it from search engines.
                    <details className="group mt-3">
                      <summary className="cursor-pointer list-none text-sm font-medium text-foreground/80 transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                        <span className="group-open:hidden">
                          Show explanation
                        </span>
                        <span className="hidden group-open:inline">
                          Hide explanation
                        </span>
                      </summary>
                      <div className="mt-2 rounded-xl bg-muted/50 px-4 py-3 text-base leading-relaxed text-muted-foreground">
                        <p>{q.solution_text}</p>
                        {q.solution_text_assamese ? (
                          <p className="mt-1.5">{q.solution_text_assamese}</p>
                        ) : null}
                      </div>
                    </details>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
