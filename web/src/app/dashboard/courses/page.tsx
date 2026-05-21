// ============================================================================
// /dashboard/courses — admin/instructor courses management
// ============================================================================
// Server component:
//   1. Gates access (INSTRUCTOR or ADMIN only)
//   2. Parses URL search params via nuqs cache
//   3. Fires server-side prefetch — populates QueryClient cache before hydration
//   4. Composes <Container> → <HydrateClient> → <ErrorBoundary> → <Content>
//      Content uses useQuery + keepPreviousData (no Suspense flash on filter).
//
// Industry pattern (Netflix/Vercel/Linear) — REST equivalent of tRPC's
// HydrateClient flow. First paint has data (no loading spinner); subsequent
// search/filter updates keep previous results visible (smooth, no shift).
//
// ErrorBoundary kept as safety net for unexpected render errors; query
// errors are handled INLINE in <AdminCoursesContent> with retry button.
// ============================================================================

import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient } from "@/lib/hydrate-client";
import { requireRole } from "@/lib/helpers/auth-helpers";
import { courseParamsCache } from "@/features/courses/server/params-loader";
import { prefetchCourses } from "@/features/courses/server/prefetch";
import {
  AdminCoursesContainer,
  AdminCoursesContent,
  AdminCoursesError,
} from "@/features/courses/components/AdminCoursesView";
import type { ListCoursesQuery } from "@/features/courses/types";

export const metadata: Metadata = {
  title: "Courses · Dashboard",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function DashboardCoursesPage({ searchParams }: Props) {
  // Only INSTRUCTOR + ADMIN can access this page
  await requireRole("INSTRUCTOR", "ADMIN");

  // Parse URL search params via nuqs cache
  const params = await courseParamsCache.parse(searchParams);

  // Build API query — same shape as client `useCourses` → same queryKey
  const apiQuery: ListCoursesQuery = {
    q: params.search || undefined,
    status:
      params.status === "all"
        ? "DRAFT,COMING_SOON,UPCOMING,LIVE,COMPLETED,ARCHIVED"
        : params.status,
    level: params.level ?? undefined,
    tag: params.tag ?? undefined,
    cursor: params.cursor ?? undefined,
    sort: params.sort,
    page: params.page,
    limit: params.pageSize,
  };

  // Server-side prefetch — populates cache. Client useQuery reads it on mount.
  await prefetchCourses(apiQuery);

  return (
    <AdminCoursesContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<AdminCoursesError />}>
          {/* <Suspense fallback={<AdminCourseTableSkeleton />}> */}
          <AdminCoursesContent />
          {/* </Suspense> */}
        </ErrorBoundary>
      </HydrateClient>
    </AdminCoursesContainer>
  );
}
