"use server";

import { cacheLife, cacheTag } from "next/cache";
import { prisma, type Prisma } from "@repo/db";
import { pyqSlug } from "../utils/pyq-slug";

// PYQ = an Exam explicitly flagged is_pyq_public (the admin-controlled SEO
// allowlist, deliberately separate from is_free). There is no PreviousYearPaper
// table — see packages/db schema + CLAUDE.md content hierarchy.

const pyqListSelect = {
  id: true,
  name: true,
  subject: true,
  category: true,
  series_name: true,
  year: true,
  image_url: true,
  updated_at: true,
} satisfies Prisma.ExamSelect;

type PyqListRow = Prisma.ExamGetPayload<{ select: typeof pyqListSelect }>;
export type PyqListItem = PyqListRow & { slug: string };

export async function getPublicPyqPapers(): Promise<PyqListItem[]> {
  "use cache";
  cacheTag("pyq:all");
  cacheLife("days");

  const rows = await prisma.exam.findMany({
    where: { is_pyq_public: true, is_active: true },
    select: pyqListSelect,
    orderBy: [{ year: "desc" }, { name: "asc" }],
  });
  return rows.map((r) => ({ ...r, slug: pyqSlug(r.name, r.year) }));
}

// slugs for generateStaticParams — prerender one static page per paper so
// navigation is instant and crawlers get fully-rendered HTML.
export async function getPublicPyqSlugs(): Promise<string[]> {
  const papers = await getPublicPyqPapers();
  return papers.map((p) => p.slug);
}

const pyqDetailSelect = {
  id: true,
  name: true,
  subject: true,
  category: true,
  series_name: true,
  year: true,
  updated_at: true,
  // is_correct + solutions ARE sent here on purpose. The anti-cheat rule bars
  // is_correct only *during an active attempt*; a public PYQ page is not an
  // attempt — the solved answer IS the SEO content. Gated by is_pyq_public.
  questions: {
    orderBy: { order: "asc" },
    select: {
      id: true,
      content: true,
      content_assamese: true,
      solution_text: true,
      solution_text_assamese: true,
      order: true,
      options: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          text: true,
          text_assamese: true,
          is_correct: true,
          order: true,
        },
      },
    },
  },
} satisfies Prisma.ExamSelect;

export type PyqPaper = Prisma.ExamGetPayload<{ select: typeof pyqDetailSelect }>;

export async function getPyqPaperBySlug(slug: string): Promise<PyqPaper | null> {
  "use cache";
  cacheTag(`pyq:${slug}`);
  cacheLife("days");

  // resolve slug → exam id via the cached allowlist (small set), then load the
  // full paper. Re-assert is_pyq_public so an unlisted exam can never leak.
  const papers = await getPublicPyqPapers();
  const match = papers.find((p) => p.slug === slug);
  if (!match) return null;

  return prisma.exam.findFirst({
    where: { id: match.id, is_pyq_public: true, is_active: true },
    select: pyqDetailSelect,
  });
}
