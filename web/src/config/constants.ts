// ============================================================================
// constants.ts — Project-wide tunable constants
// ============================================================================
// Lives outside any feature so admin tables, public list pages, search hooks
// all share the same numbers.
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  MIN_PAGE_SIZE: 1,
} as const;

// Query stale times (ms) — TanStack Query defaults per data type
export const STALE_TIME = {
  /** Lists refresh on focus, but stay fresh during quick navigation */
  LIST: 30 * 1000, // 30 sec
  /** Detail pages — slower-changing data */
  DETAIL: 60 * 1000, // 1 min
  /** Static-ish data (categories, tags) */
  STATIC: 10 * 60 * 1000, // 10 min
} as const;
