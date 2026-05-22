// ============================================================================
// extract-r2-keys.ts — Find every R2 object key referenced in TipTap HTML
// ============================================================================
// When a course is deleted (or its description edited heavily), embedded
// images/videos must be cleaned up from R2 — otherwise storage fills with
// orphans.
//
// Strategy (mirror blog route's pattern):
//   1. Primary: every embed node renders with `data-r2-key="..."` attribute.
//      Single regex extracts all keys. Single source of truth.
//   2. Fallback: legacy posts (created before r2-key attribute landed) —
//      URL prefix matching. R2_PUBLIC_URL + key. Strip `?v=…` cache-bust +
//      `?X-Amz-...` presigned params to get the pure key.
//
// Returns deduplicated array — same image referenced twice → one delete call.
//
// NOTE: Backend duplicates this logic (`api/src/modules/courses/extract-r2-keys.ts`)
// because cleanup happens server-side in DELETE service. Keep in sync.
// ============================================================================

const KEY_ATTR_RE = /data-r2-key="([^"]+)"/g;

/** Extract every R2 object key referenced by a stored TipTap HTML doc. */
export function extractR2Keys(html: string): string[] {
  if (!html) return [];

  const keys = new Set<string>();

  // ─── Primary: data-r2-key attributes ───
  for (const match of html.matchAll(KEY_ATTR_RE)) {
    if (match[1]) keys.add(match[1]);
  }

  // ─── Fallback: URL-based extraction for legacy posts ───
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
  if (publicUrl) {
    const urlRe = new RegExp(
      `(?:src|href)="${escapeRegex(publicUrl)}/([^"?#]+)`,
      "g",
    );
    for (const match of html.matchAll(urlRe)) {
      if (match[1]) keys.add(decodeURIComponent(match[1]));
    }
  }

  return Array.from(keys);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
