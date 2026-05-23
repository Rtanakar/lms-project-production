// ============================================================================
// use-courses.ts — Courses list hook (offset pagination + keepPreviousData)
// ============================================================================
// Encapsulates the standard 4 pieces every courses listing needs:
//   1. URL state (nuqs)         → search/status/level/sort/page
//   2. Debounced search input   → 400ms idle before query fires
//   3. TanStack Query           → fetchCourses + keepPreviousData
//   4. Filter + pagination helpers (page reset on filter change, etc.)
//
// Two modes:
//   • Default (admin)    → ALL statuses including DRAFT/ARCHIVED. `status`
//     filter is honored; "all" expands to the CSV of every status.
//   • `publicMode: true` → NEVER sends `status` → backend applies the public
//     allowlist (COMING_SOON / UPCOMING / LIVE / COMPLETED). Marketing pages
//     should never let visitors filter to DRAFT / ARCHIVED, even via URL
//     tampering. The hook also stops surfacing `setStatus` so consumers
//     can't accidentally wire a status dropdown into a public UI.
// ============================================================================

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { STALE_TIME } from "@/config/constants";
import { useCourseParams } from "./use-courses-params";
import { useCoursesSearch } from "./use-courses-search";
import { courseKeys } from "../api/course-keys";
import { fetchCourses } from "../api/courses-api";
import type { ListCoursesQuery } from "../types";

interface UseCoursesOptions {
  /** When true, omit `status` from the API query so the backend's public
   *  allowlist kicks in. Use on `/courses` and `/my-courses`. */
  publicMode?: boolean;
}

export function useCourses({ publicMode = false }: UseCoursesOptions = {}) {
  const [params, setParams] = useCourseParams();
  const { searchValue, onSearchChange } = useCoursesSearch({
    params,
    setParams,
  });

  // ─── Build API query ─────────────────────────────────────────────────
  // Admin mode: "all" → CSV expansion (the backend treats absence as
  // "public statuses only", which admins don't want).
  // Public mode: status undefined → backend default kicks in.
  const apiQuery: ListCoursesQuery = {
    q: params.search || undefined,
    status: publicMode
      ? undefined
      : params.status === "all"
        ? "DRAFT,COMING_SOON,UPCOMING,LIVE,COMPLETED,ARCHIVED"
        : params.status,
    level: params.level ?? undefined,
    sort: params.sort,
    page: params.page,
    limit: params.pageSize,
  };

  const query = useQuery({
    queryKey: courseKeys.list(apiQuery),
    queryFn: () => fetchCourses(apiQuery),
    staleTime: STALE_TIME.LIST,
    // Previous results stay visible during refetch. `isPlaceholderData` is
    // exposed via the `...query` spread below so views can toggle skeletons.
    placeholderData: keepPreviousData,
  });

  // ─── Pagination helpers ───
  const goToPage = (p: number) => setParams({ page: p });

  const goNext = () => {
    if (query.data?.pagination.hasNext) {
      setParams({ page: params.page + 1 });
    }
  };

  const goPrev = () => {
    if (query.data?.pagination.hasPrev) {
      setParams({ page: params.page - 1 });
    }
  };

  // ─── Filter helpers (page reset on every filter change) ───
  const setStatus = (status: typeof params.status) =>
    setParams({ status, page: 1 });

  const setLevel = (level: typeof params.level) =>
    setParams({ level, page: 1 });

  const setSort = (sort: typeof params.sort) => setParams({ sort, page: 1 });

  // `hasFilters` excludes `status` in public mode (it's locked).
  const hasFilters =
    !!params.search ||
    (!publicMode && params.status !== "all") ||
    !!params.level;

  return {
    // ─── Query state (isLoading / isFetching / isPlaceholderData / etc.) ───
    ...query,
    items: query.data?.items ?? [],
    pagination: query.data?.pagination,

    // ─── Search ───
    searchValue,
    onSearchChange,

    // ─── Filters ───
    status: params.status,
    level: params.level,
    sort: params.sort,
    hasFilters,
    setStatus,
    setLevel,
    setSort,

    // ─── Pagination ───
    page: params.page,
    pageSize: params.pageSize,
    goToPage,
    goNext,
    goPrev,
  };
}
