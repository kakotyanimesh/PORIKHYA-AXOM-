// Blog-style slug for a public PYQ paper. Exam has no slug column, so the URL
// is derived from name + year and resolved back by scanning the (small, cached)
// public-PYQ list — see getPyqPaperBySlug.
// ponytail: first-match wins on a slug collision; add a real slug column to
// Exam if the public set ever grows large enough for that to bite.

export function pyqSlug(name: string, year: number | null): string {
  const base = year ? `${name} ${year}` : name;
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // ascii-only for clean, stable URLs
    .replace(/^-+|-+$/g, "");
  // name may be pure Assamese script → empty slug; fall back so it still resolves
  return slug || "paper";
}
