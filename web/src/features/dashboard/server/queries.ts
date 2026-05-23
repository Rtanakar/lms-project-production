// ============================================================================
// dashboard/server/queries.ts — shared query shapes (pure data, no I/O)
// ============================================================================
// Why this file is separate from `prefetch.ts`:
//   • `prefetch.ts` imports `next/headers` (cookies forwarding) → server-only
//   • Client components (`DashboardStatsLive`, `RecentCoursesPanel`,
//     `RecommendedCoursesPanel`) need the same query SHAPES so their
//     `useQuery({ queryKey })` matches the server's prefetched key
//   • If they imported from `prefetch.ts` directly, Turbopack would pull
//     `next/headers` into the client bundle → "This API is only available
//     in Server Components" build error
//   • Keeping the constants here (zero imports beyond TS types) lets both
//     sides import safely — no marker required, file is intrinsically
//     environment-neutral
//
// Rule of thumb: anything inside `server/` that touches `next/headers`,
// `cookies()`, `headers()`, or any other server-only API must NOT be
// re-exported through a barrel that a client component reaches.
// ============================================================================

// ============================================================================
// DASHBOARD_QUERIES — single source of truth for prefetch + client useQuery
// ============================================================================
// Each shape ends up as a TanStack queryKey via `courseKeys.list(...)`.
// Identical objects on server (prefetch) and client (useQuery) → cache hit
// on first paint, zero loading flash.
// ============================================================================
export const DASHBOARD_QUERIES = {
  // Total catalog size (all statuses, including DRAFT/ARCHIVED for admin)
  totalAll: {
    status: "DRAFT,COMING_SOON,UPCOMING,LIVE,COMPLETED,ARCHIVED",
    page: 1,
    limit: 1, // we only need pagination.total
    sort: "newest" as const,
  },
  // Live cohorts (broadcasting now)
  live: {
    status: "LIVE",
    page: 1,
    limit: 1,
    sort: "newest" as const,
  },
  // Upcoming + coming-soon (registration windows open)
  upcoming: {
    status: "UPCOMING,COMING_SOON",
    page: 1,
    limit: 1,
    sort: "newest" as const,
  },
  // Recent 5 across all statuses — feeds the ADMIN/INSTRUCTOR right-rail panel
  recent: {
    status: "DRAFT,COMING_SOON,UPCOMING,LIVE,COMPLETED,ARCHIVED",
    page: 1,
    limit: 5,
    sort: "newest" as const,
  },
} as const;
