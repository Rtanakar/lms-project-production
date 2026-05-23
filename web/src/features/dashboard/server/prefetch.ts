// ============================================================================
// dashboard/server/prefetch.ts — Server-side prefetch for the dashboard home
// ============================================================================
// Server-only (touches `next/headers` transitively via `prefetchCourses`).
// Constants live in `./queries.ts` so client components can import them
// without dragging `next/headers` into the browser bundle.
//
// Why three parallel courses queries (instead of one big one + client-side
// counting)?
//   • Backend supports `status` filter natively — each call returns
//     `pagination.total` for that status. Free counts, no over-fetch.
//   • Parallel via `Promise.all` → all three roundtrips finish in the time
//     of the slowest. Worst case ≈ 1 query latency, not 3×.
//   • Each query lives under its own queryKey in TanStack cache → client
//     reads them via `useQuery` with the SAME key for instant hydration.
// ============================================================================

import { prefetchCourses } from "@/features/courses/server/prefetch";
import { DASHBOARD_QUERIES } from "./queries";

// ============================================================================
// prefetchDashboard — ADMIN/INSTRUCTOR fan-out
// ============================================================================
// Dashboard is staff-only (STUDENTs are bounced at the layout). We warm
// total + live + upcoming counts + the recent-5 list in parallel.
//
// `Promise.all` → all queries run in parallel; the longest one paces the
// page render. Suspense unblocks once every prefetch resolves.
// ============================================================================
export async function prefetchDashboard() {
  await Promise.all([
    prefetchCourses(DASHBOARD_QUERIES.totalAll),
    prefetchCourses(DASHBOARD_QUERIES.live),
    prefetchCourses(DASHBOARD_QUERIES.upcoming),
    prefetchCourses(DASHBOARD_QUERIES.recent),
  ]);
}
