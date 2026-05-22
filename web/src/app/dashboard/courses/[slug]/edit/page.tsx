// ============================================================================
// /dashboard/courses/[slug]/edit — edit course page
// ============================================================================
// Server component:
//   1. Gates access (INSTRUCTOR / ADMIN only — backend owner-check also runs)
//   2. Reads `[slug]` from route params
//   3. Server-prefetches the course detail → populates QueryClient cache
//   4. Composes Container → HydrateClient → ErrorBoundary → Content
//
// Next 16: `params` is a Promise — must be awaited. (Breaking change from 15.)
//
// Industry pattern (Netflix/Vercel/Linear admin):
//   - First paint already has data (no spinner flash)
//   - <EditCourseLoading> only shows on slow networks / cache miss
//   - <EditCourseError> handles 404 / 403 / network failures inside the
//     content boundary (so chrome stays visible)
// ============================================================================

import type { Metadata } from "next";
import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient } from "@/lib/hydrate-client";
import { requireRole } from "@/lib/helpers/auth-helpers";
import { prefetchCourseBySlug } from "@/features/courses/server/prefetch";
import {
  EditCourseContainer,
  EditCourseContent,
  EditCourseError,
} from "@/features/courses/components/EditCourseView";

export const metadata: Metadata = {
  title: "Edit course · Dashboard",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  // Only INSTRUCTOR + ADMIN can edit (server enforces owner-or-admin too)
  await requireRole("INSTRUCTOR", "ADMIN");

  const { slug } = await params;

  // Server-side prefetch — same queryKey as client `useCourse(slug)`.
  // If the course doesn't exist or user can't access, the request will
  // fail silently here and the client query will refetch + surface the
  // error via <EditCourseError> inside the boundary.
  await prefetchCourseBySlug(slug);

  return (
    <EditCourseContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<EditCourseError />}>
          <EditCourseContent slug={slug} />
        </ErrorBoundary>
      </HydrateClient>
    </EditCourseContainer>
  );
}
