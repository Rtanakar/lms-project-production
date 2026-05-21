// ============================================================================
// use-courses.ts — TanStack Query hooks for courses
// ============================================================================
// Industry pattern:
//   - Query keys constant → centralized invalidation
//   - Mutations auto-invalidate list + detail caches
//   - `placeholderData: keepPreviousData` → smooth pagination (no flicker)
// ============================================================================

"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { STALE_TIME } from "@/config/constants";
import { ApiClientError } from "@/lib/api-client";
import {
  fetchCourses,
  fetchCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
} from "./courses-api";
import { courseKeys } from "./course-keys";
import type { ListCoursesQuery } from "../types";

// Re-export so existing imports `from "./use-courses"` continue to work.
// New code can import directly from `./course-keys` (server-safe).
export { courseKeys };

// ============================================================================
// LIST — paginated list with filters
// ============================================================================
export function useCourses(query: ListCoursesQuery) {
  return useQuery({
    queryKey: courseKeys.list(query),
    queryFn: () => fetchCourses(query),
    staleTime: STALE_TIME.LIST,
    // Smooth pagination — keep previous data while loading next page
    placeholderData: keepPreviousData,
  });
}

// ============================================================================
// DETAIL — by slug
// ============================================================================
export function useCourseBySlug(slug: string) {
  return useQuery({
    queryKey: courseKeys.detail(slug),
    queryFn: () => fetchCourseBySlug(slug),
    staleTime: STALE_TIME.DETAIL,
    enabled: !!slug,
  });
}

// ============================================================================
// Shared invalidation helper
// ============================================================================
function useInvalidateCourses() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: courseKeys.all });
}

// ============================================================================
// CREATE
// ============================================================================
export function useCreateCourse() {
  const invalidate = useInvalidateCourses();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createCourse(data),
    onSuccess: () => {
      invalidate();
      toast.success("Course created");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiClientError ? err.message : "Failed to create course";
      toast.error(msg);
    },
  });
}

// ============================================================================
// UPDATE
// ============================================================================
export function useUpdateCourse() {
  const invalidate = useInvalidateCourses();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateCourse(id, data),
    onSuccess: () => {
      invalidate();
      toast.success("Course updated");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiClientError ? err.message : "Failed to update course";
      toast.error(msg);
    },
  });
}

// ============================================================================
// DELETE
// ============================================================================
export function useDeleteCourse() {
  const invalidate = useInvalidateCourses();
  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      invalidate();
      toast.success("Course deleted");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiClientError ? err.message : "Failed to delete course";
      toast.error(msg);
    },
  });
}
