// ============================================================================
// courses-api.ts — REST fetcher functions for courses
// ============================================================================
// Thin wrappers around `api()` from lib/api-client. Used by TanStack Query
// hooks below. Keep these as pure async functions — no React, no state.
// ============================================================================

import { api } from "@/lib/api-client";
import type {
  CourseListItem,
  CourseListResponse,
  ListCoursesQuery,
} from "../types";

// ============================================================================
// LIST courses
// ============================================================================
export async function fetchCourses(
  query: ListCoursesQuery,
): Promise<CourseListResponse> {
  return api<CourseListResponse>("/api/v1/courses", {
    method: "GET",
    params: {
      status: query.status,
      level: query.level,
      tag: query.tag,
      q: query.q,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
    },
  });
}

// ============================================================================
// GET course by slug
// ============================================================================
export async function fetchCourseBySlug(slug: string): Promise<CourseListItem> {
  return api<CourseListItem>(`/api/v1/courses/${slug}`, { method: "GET" });
}

// ============================================================================
// CREATE
// ============================================================================
export async function createCourse(
  data: Record<string, unknown>,
): Promise<CourseListItem> {
  return api<CourseListItem>("/api/v1/courses", {
    method: "POST",
    json: data,
  });
}

// ============================================================================
// UPDATE (PATCH)
// ============================================================================
export async function updateCourse(
  id: string,
  data: Record<string, unknown>,
): Promise<CourseListItem> {
  return api<CourseListItem>(`/api/v1/courses/${id}`, {
    method: "PATCH",
    json: data,
  });
}

// ============================================================================
// ARCHIVE — soft delete (status → ARCHIVED, reversible)
// ============================================================================
export async function archiveCourse(
  id: string,
  reason?: string,
): Promise<CourseListItem> {
  return api<CourseListItem>(`/api/v1/courses/${id}/archive`, {
    method: "POST",
    json: reason ? { reason } : {},
  });
}

// ============================================================================
// RESTORE — ARCHIVED → DRAFT (re-publish explicit)
// ============================================================================
export async function restoreCourse(id: string): Promise<CourseListItem> {
  return api<CourseListItem>(`/api/v1/courses/${id}/restore`, {
    method: "POST",
  });
}

// ============================================================================
// DELETE — hard delete (ADMIN only, cascades modules + FAQs)
// ============================================================================
export async function deleteCourse(id: string): Promise<void> {
  return api<void>(`/api/v1/courses/${id}`, { method: "DELETE" });
}
