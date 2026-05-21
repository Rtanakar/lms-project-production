// ============================================================================
// params-loader.ts — URL search params (single source of truth)
// ============================================================================
// Industry pattern (Linear, Vercel, Stripe, GitHub) — ONE file defines the
// URL state schema, both client + server import from here:
//
//   • Client hook:  useQueryStates(courseParams)       → URL ↔ React state
//   • Server cache: courseParamsCache.parse(searchParams) → in page.tsx
//
// DRY: schema change → ek jagah update, dono sides automatically aligned.
// ============================================================================

import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  createSearchParamsCache,
} from "nuqs/server";
import { PAGINATION } from "@/config/constants";

const COURSE_STATUSES = [
  "all",
  "DRAFT",
  "COMING_SOON",
  "UPCOMING",
  "LIVE",
  "COMPLETED",
  "ARCHIVED",
] as const;

const COURSE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

const COURSE_SORTS = [
  "newest",
  "oldest",
  "price-asc",
  "price-desc",
  "popular",
  "rating",
] as const;

// ============================================================================
// courseParams — single schema definition
// ============================================================================
// Typed enum generics → autocomplete on values.
// `clearOnDefault: true` → default value === drop from URL → clean shareable
// links (e.g., default page won't show `?page=1`).
// ============================================================================
export const courseParams = {
  // ── Offset pagination (back-compat + "jump to page N" UX) ──
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),

  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),

  // ── Cursor pagination (preferred for stable next-page) ──
  cursor: parseAsString.withOptions({ clearOnDefault: true }),

  limit: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),

  // ── Filters ──
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),

  // status — "all" = no filter (admin sees DRAFT/ARCHIVED too)
  status: parseAsStringEnum<(typeof COURSE_STATUSES)[number]>([
    ...COURSE_STATUSES,
  ])
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),

  // level is nullable — null means "all levels"
  level: parseAsStringEnum<(typeof COURSE_LEVELS)[number]>([
    ...COURSE_LEVELS,
  ]).withOptions({ clearOnDefault: true }),

  // tag is nullable — null means "no tag filter"
  tag: parseAsString.withOptions({ clearOnDefault: true }),

  sort: parseAsStringEnum<(typeof COURSE_SORTS)[number]>([...COURSE_SORTS])
    .withDefault("newest")
    .withOptions({ clearOnDefault: true }),
};

// ============================================================================
// Server-side cache — usage in page.tsx:
//   const params = await courseParamsCache.parse(searchParams);
// ============================================================================
// `createSearchParamsCache` ek object return karta hai (function nahi) —
// `.parse(searchParams)` call karke parsed values nikalo.
// ============================================================================
export const courseParamsCache = createSearchParamsCache(courseParams);
