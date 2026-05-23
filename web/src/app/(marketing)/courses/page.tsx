// ============================================================================
// /courses — Public marketplace (server prefetch + Suspense)
// ============================================================================
// Thin server component (blog pattern):
//   1. Parse URL params via the shared nuqs schema (server cache)
//   2. Fire server-side prefetch — TanStack Suspense awaits it
//   3. Compose Container · HydrateClient · ErrorBoundary · Suspense · Content
//
// All page logic (search/filter/skeleton/pagination) lives in the 4-export
// `PublicCoursesView` so this file stays maintenance-free.
// ============================================================================

import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient } from "@/lib/hydrate-client";
import { courseParamsCache } from "@/features/courses/server/params-loader";
import { prefetchCourses } from "@/features/courses/server/prefetch";
import {
  PublicCoursesContainer,
  PublicCoursesContent,
  PublicCoursesError,
  PublicCoursesLoading,
} from "@/features/courses/components/PublicCoursesView";

export const metadata: Metadata = {
  title: "Courses · LMS",
  description:
    "Browse hand-crafted programs — live cohorts, async libraries, and bootcamp-grade builds.",
  alternates: { canonical: "/courses" },
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function PublicCoursesPage({ searchParams }: Props) {
  const params = await courseParamsCache.parse(searchParams);

  // Fire-and-forget prefetch — Suspense awaits below. Public clients never
  // see DRAFT/ARCHIVED, so we pass `status: undefined` (backend allowlist
  // kicks in).
  prefetchCourses({
    q: params.search || undefined,
    level: params.level ?? undefined,
    sort: params.sort,
    page: params.page,
    limit: params.pageSize,
  });

  return (
    <PublicCoursesContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<PublicCoursesError />}>
          <Suspense fallback={<PublicCoursesLoading />}>
            <PublicCoursesContent />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </PublicCoursesContainer>
  );
}
