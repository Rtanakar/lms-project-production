// ============================================================================
// use-courses.ts — TanStack Query hooks for courses
// ============================================================================
// Industry pattern:
//   - Query keys constant → centralized invalidation
//   - Mutations auto-invalidate list + detail caches
//   - `placeholderData: keepPreviousData` → smooth pagination (no flicker)
//   - Detail mutations also invalidate the specific detail cache by slug/id
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
  archiveCourse,
  restoreCourse,
  deleteCourse,
} from "./courses-api";
import { courseKeys } from "./course-keys";
import type {
  CreateCourseInput,
  UpdateCourseInput,
} from "../validators/course-validator";
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
// DETAIL — by slug (alias `useCourse` for edit-form symmetry)
// ============================================================================
export function useCourseBySlug(slug: string) {
  return useQuery({
    queryKey: courseKeys.detail(slug),
    queryFn: () => fetchCourseBySlug(slug),
    staleTime: STALE_TIME.DETAIL,
    enabled: !!slug,
  });
}

/** Alias — used by edit form. URL is `/dashboard/courses/[slug]/edit`. */
export const useCourse = useCourseBySlug;

// ============================================================================
// Shared invalidation helpers
// ============================================================================
function useInvalidateCoursesList() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: courseKeys.lists() });
}

function useInvalidateCourseDetail() {
  const qc = useQueryClient();
  return (slug: string) =>
    qc.invalidateQueries({ queryKey: courseKeys.detail(slug) });
}

function useInvalidateAllCourses() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: courseKeys.all });
}

// ============================================================================
// CREATE
// ============================================================================
// Build clean API payload from form values — strip empty strings → undefined
// so backend treats them as "not provided" (Zod optional).
// ============================================================================
function cleanCreatePayload(data: CreateCourseInput): Record<string, unknown> {
  // CREATE schema is `.optional()` (not `.nullable()`) for every optional
  // field, so null / "" / undefined must all be DROPPED — not sent. Sending
  // null on e.g. startDate triggers "Invalid request data" because
  // z.coerce.date().optional() doesn't accept null.
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === "" || v === null || v === undefined) continue;
    out[k] = v;
  }
  return out;
}

export function useCreateCourse() {
  const invalidate = useInvalidateAllCourses();
  return useMutation({
    mutationFn: (data: CreateCourseInput) =>
      createCourse(cleanCreatePayload(data)),
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
// UPDATE — by id (passes `slug` for cache invalidation hint)
// ============================================================================
// Edit form `useUpdateCourse(slug)` returns a mutation that takes `{ id, data }`.
// Slug is required so we can invalidate the specific detail cache too.
// ============================================================================
function cleanUpdatePayload(data: UpdateCourseInput): Record<string, unknown> {
  // For PATCH, keep nulls (explicit "set to null"), drop empty strings.
  const clean = (v: unknown) => (v === "" ? undefined : v);
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, clean(v)]),
  );
}

export function useUpdateCourse(slug?: string) {
  const invalidateLists = useInvalidateCoursesList();
  const invalidateDetail = useInvalidateCourseDetail();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseInput }) =>
      updateCourse(id, cleanUpdatePayload(data)),
    onSuccess: () => {
      invalidateLists();
      if (slug) invalidateDetail(slug);
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
// ARCHIVE — soft delete (INSTRUCTOR owner / ADMIN)
// ============================================================================
export function useArchiveCourse(slug?: string) {
  const invalidateLists = useInvalidateCoursesList();
  const invalidateDetail = useInvalidateCourseDetail();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      archiveCourse(id, reason),
    onSuccess: () => {
      invalidateLists();
      if (slug) invalidateDetail(slug);
      toast.success("Course archived");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Failed to archive course";
      toast.error(msg);
    },
  });
}

// ============================================================================
// RESTORE — ARCHIVED → DRAFT
// ============================================================================
export function useRestoreCourse(slug?: string) {
  const invalidateLists = useInvalidateCoursesList();
  const invalidateDetail = useInvalidateCourseDetail();
  return useMutation({
    mutationFn: (id: string) => restoreCourse(id),
    onSuccess: () => {
      invalidateLists();
      if (slug) invalidateDetail(slug);
      toast.success("Course restored");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Failed to restore course";
      toast.error(msg);
    },
  });
}

// ============================================================================
// DELETE — hard delete (ADMIN only, cascades modules + FAQs + R2 cleanup)
// ============================================================================
// NOTE: this hook intentionally does NOT toast — callers wrap `mutateAsync`
// with `toast.promise` to get a single loading → success/error row. If we
// also toasted here the user would see two messages for one action.
export function useDeleteCourse() {
  const invalidate = useInvalidateAllCourses();
  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      invalidate();
    },
  });
}
