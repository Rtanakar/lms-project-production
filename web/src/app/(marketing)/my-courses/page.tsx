// ============================================================================
// /my-courses — Student's library (server prefetch + Suspense)
// ============================================================================
// Same composition as /courses — search/filter at top, skeleton on every
// transition, PaginationControls at bottom. All logic in MyCoursesView so
// this file stays declarative.
//
// Sign-in gate lives in the Content component (not here) because we still
// want the hero strip + back-to-courses link to render for anon users.
// ============================================================================

import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient } from "@/lib/hydrate-client";
import { courseParamsCache } from "@/features/courses/server/params-loader";
import { prefetchCourses } from "@/features/courses/server/prefetch";
import {
  MyCoursesContainer,
  MyCoursesContent,
  MyCoursesError,
  MyCoursesLoading,
} from "@/features/courses/components/MyCoursesView";

export const metadata: Metadata = {
  title: "My Courses · LMS",
  description:
    "Continue where you left off. Track progress and earn certificates.",
  alternates: { canonical: "/my-courses" },
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function MyCoursesPage({ searchParams }: Props) {
  const params = await courseParamsCache.parse(searchParams);

  // Same prefetch as /courses for now — until the real enrollment API ships,
  // we render the public list with a mock progress overlay. When the
  // Enrollment model lands, switch to `prefetchMyEnrollments(userId)` and
  // the queryKey naturally diverges.
  prefetchCourses({
    q: params.search || undefined,
    level: params.level ?? undefined,
    sort: params.sort,
    page: params.page,
    limit: params.pageSize,
  });

  return (
    <MyCoursesContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<MyCoursesError />}>
          <Suspense fallback={<MyCoursesLoading />}>
            <MyCoursesContent />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </MyCoursesContainer>
  );
}
