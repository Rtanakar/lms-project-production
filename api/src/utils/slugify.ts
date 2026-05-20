// ============================================================================
// slugify.ts — URL slug generator (no external dep)
// ============================================================================
// Industry-standard kebab-case slug:
//   "3.0 Job Ready AI Cohort" → "3-0-job-ready-ai-cohort"
//   "C++ Mastery"             → "c-mastery"
//
// Handles: unicode normalize, accent removal, alphanumeric-only,
// trim hyphens, collapse multiple hyphens.
// ============================================================================

export function slugify(input: string): string {
  return input
    .normalize("NFKD") // decompose accented chars (é → e + ´)
    .replace(/[\u0300-\u036f]/g, "") // strip combining marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .replace(/-{2,}/g, "-") // collapse multiple hyphens
    .slice(0, 80); // max length safety
}

// ----------------------------------------------------------------------------
// uniqueSlugify — appends -2, -3, ... if slug already exists
// ----------------------------------------------------------------------------
// Service layer me use karte hain — collision pe auto-suffix.
//   existing: ["my-course", "my-course-2"]
//   input:    "My Course"
//   output:   "my-course-3"
// ----------------------------------------------------------------------------
export async function uniqueSlugify(
  input: string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(input);
  if (!(await checkExists(base))) return base;

  // Try suffixes 2, 3, 4, ... up to 100
  for (let i = 2; i <= 100; i++) {
    const candidate = `${base}-${i}`;
    if (!(await checkExists(candidate))) return candidate;
  }

  // Extremely unlikely fallback — append random
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}
