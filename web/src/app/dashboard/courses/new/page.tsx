// ============================================================================
// /dashboard/courses/new — create course page
// ============================================================================
// Server component:
//   1. Gates access (INSTRUCTOR / ADMIN only)
//   2. Composes Container → ErrorBoundary → Content
//
// No data prefetch needed (fresh form). ErrorBoundary catches render errors.
// On submit, `useCreateCourse` → on success → router.push to edit page.
// ============================================================================

import type { Metadata } from "next";
import { ErrorBoundary } from "react-error-boundary";
import { requireRole } from "@/lib/helpers/auth-helpers";
import {
  CreateCourseContainer,
  CreateCourseContent,
  CreateCourseError,
} from "@/features/courses/components/CreateCourseView";

export const metadata: Metadata = {
  title: "New course · Dashboard",
};

export default async function NewCoursePage() {
  // Only INSTRUCTOR + ADMIN can create courses
  await requireRole("INSTRUCTOR", "ADMIN");

  return (
    <CreateCourseContainer>
      <ErrorBoundary fallback={<CreateCourseError />}>
        <CreateCourseContent />
      </ErrorBoundary>
    </CreateCourseContainer>
  );
}
