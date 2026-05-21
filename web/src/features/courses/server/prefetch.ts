// ============================================================================
// prefetch.ts — Server-side TanStack Query prefetch for courses list
// ============================================================================
// Fires the courses list query on the SERVER before the client renders.
// Cache is dehydrated by <HydrateClient> and rehydrated on the client →
// `useSuspenseQuery` in <AdminCoursesContent> reads the prefilled cache
// instantly (no loading flash, no waterfall).
//
// Cookies forwarding: server components don't auto-send browser cookies.
// `cookies()` is async in Next 16 — read header once, pass to api-client.
// ============================================================================

import { cookies } from "next/headers";
import { api } from "@/lib/api-client";
import { getQueryClient } from "@/lib/query-client";
import { STALE_TIME } from "@/config/constants";
// Import from `course-keys` (pure module) — NOT from `use-courses` (which is
// "use client"). Server cannot use functions from client-marked modules.
import { courseKeys } from "../api/course-keys";
import type {
  CourseListResponse,
  ListCoursesQuery,
} from "../types";

// ============================================================================
// Server-only fetcher — same shape as client `fetchCourses` but with cookies
// ============================================================================
async function fetchCoursesServer(
  query: ListCoursesQuery,
  cookie: string,
): Promise<CourseListResponse> {
  return api<CourseListResponse>("/api/v1/courses", {
    method: "GET",
    cookie,
    params: {
      status: query.status,
      level: query.level,
      tag: query.tag,
      q: query.q,
      cursor: query.cursor,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
    },
  });
}

// ============================================================================
// prefetchCourses — call this in page.tsx (no await — Suspense waits for it)
// ============================================================================
// Same queryKey as client `useCourses(query)` → cache hit, zero refetch.
// ============================================================================
export async function prefetchCourses(query: ListCoursesQuery) {
  const queryClient = getQueryClient();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  await queryClient.prefetchQuery({
    queryKey: courseKeys.list(query),
    queryFn: () => fetchCoursesServer(query, cookieHeader),
    staleTime: STALE_TIME.LIST,
  });
}
