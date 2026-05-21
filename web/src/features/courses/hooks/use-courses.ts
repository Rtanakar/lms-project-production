// ============================================================================
// use-courses.ts — Courses list hook (offset pagination + keepPreviousData)
// ============================================================================

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { STALE_TIME } from "@/config/constants";
import { useCourseParams } from "./use-courses-params";
import { useCoursesSearch } from "./use-courses-search";
import { courseKeys } from "../api/course-keys";
import { fetchCourses } from "../api/courses-api";
import type { ListCoursesQuery } from "../types";

export function useCourses() {
  const [params, setParams] = useCourseParams();
  const { searchValue, onSearchChange } = useCoursesSearch({
    params,
    setParams,
  });

  // ─── Build API query ───
  const apiQuery: ListCoursesQuery = {
    q: params.search || undefined,
    status:
      params.status === "all"
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
    placeholderData: keepPreviousData, // ✅ search/filter/page pe no skeleton flash
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

  // ─── Filter helpers ───
  const setStatus = (status: typeof params.status) =>
    setParams({ status, page: 1 }); // page reset on filter change

  const setLevel = (level: typeof params.level) =>
    setParams({ level, page: 1 });

  const setSort = (sort: typeof params.sort) => setParams({ sort, page: 1 });

  const hasFilters =
    !!params.search || params.status !== "all" || !!params.level;

  return {
    // ─── Query state ───
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
    goToPage,
    goNext,
    goPrev,
  };
}
