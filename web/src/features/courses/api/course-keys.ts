// ============================================================================
// course-keys.ts — TanStack Query key factory (server-safe, no "use client")
// ============================================================================
// Keys factory ko alag file me rakhna IMPORTANT hai:
//   - use-courses.ts is "use client" — hooks browser-only
//   - prefetch.ts is server — needs queryKey to match client
//
// Agar keys ko "use client" file se import kare server pe, Next.js RSC boundary
// pe function reference lose ho jata hai → `courseKeys.list is not a function`.
//
// Solution: pure module (this file) — both server + client import safely.
// ============================================================================

import type { ListCoursesQuery } from "../types";

// ============================================================================
// Query keys — single source of truth
// ============================================================================
// Hierarchy:
//   ["courses"]                 → all course-related queries
//   ["courses", "list", {...}]  → paginated list with filters
//   ["courses", "detail", slug] → single course
//
// invalidate(["courses"]) invalidates ALL nested → safe after mutations.
// ============================================================================
export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (query: ListCoursesQuery) => [...courseKeys.lists(), query] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (slug: string) => [...courseKeys.details(), slug] as const,
};
