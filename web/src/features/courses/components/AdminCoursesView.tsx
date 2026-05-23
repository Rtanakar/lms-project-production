// ============================================================================
// AdminCoursesView.tsx — Composed exports for /dashboard/courses
// ============================================================================
// Industry pattern (Netflix/Linear/Vercel) — server page composes:
//
//   <AdminCoursesContainer>          ← layout chrome (header + new-course CTA)
//     <HydrateClient>
//       <ErrorBoundary FallbackComponent={AdminCoursesError}>
//         <Suspense fallback={<AdminCoursesLoading />}>
//           <AdminCoursesContent />   ← useSuspenseQuery → reads hydrated cache
//         </Suspense>
//       </ErrorBoundary>
//     </HydrateClient>
//   </AdminCoursesContainer>
//
// Benefits over single-component:
//   - Container renders instantly (header/CTA visible while data loads)
//   - Suspense fallback is skeleton (not spinner) → perceived perf
//   - ErrorBoundary catches React-render errors AND query errors (TanStack
//     throwOnError) → graceful retry path
// ============================================================================

"use client";

import Link from "next/link";
import { Plus, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/PaginationControls";
import { useCourses } from "../hooks/use-courses";
import { AdminCourseSearch } from "./AdminCoursesSearch";
import {
  AdminCourseTable,
  AdminCourseTableSkeleton,
} from "./AdminCoursesTable";

// ============================================================================
// Container — page chrome (header + CTA). Renders sync, before data loads.
// ============================================================================
export function AdminCoursesContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-4 lg:p-6">
      {/* ─── Page header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-5 w-1 rounded-full bg-[#FF5A1F]" />
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #fff 0%, #FFF7EC 60%, #FFB07A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Courses
            </h1>
          </div>
          <p className="mt-1 ml-3 text-sm text-white/55">
            Manage your courses, modules, and FAQs.
          </p>
        </div>

        <Button
          asChild
          className="shadow-lg shadow-[rgba(224,74,18,0.35)]"
          style={{ background: "linear-gradient(135deg,#FF5A1F,#E04A12)" }}
        >
          <Link href="/dashboard/courses/new" className="gap-2">
            <Plus className="size-4" />
            New course
          </Link>
        </Button>
      </div>

      {children}
    </div>
  );
}

// ============================================================================
// Loading — Suspense fallback (skeleton, not spinner)
// ============================================================================
export function AdminCoursesLoading() {
  return (
    <div className="space-y-5">
      {/* Search bar skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-9 w-full max-w-sm animate-pulse rounded-md bg-[rgba(255,90,31,0.08)]" />
        <div className="h-9 w-24 animate-pulse rounded-md bg-[rgba(255,90,31,0.08)]" />
      </div>
      {/* Count chip skeleton */}
      <div className="flex justify-end">
        <div className="h-3 w-20 animate-pulse rounded bg-[rgba(255,90,31,0.08)]" />
      </div>
      {/* Table skeleton */}
      <AdminCourseTableSkeleton rows={8} />
    </div>
  );
}

// ============================================================================
// Error — ErrorBoundary fallback (retry on click)
// ============================================================================
export function AdminCoursesError({
  error,
  resetErrorBoundary,
}: {
  error?: Error;
  resetErrorBoundary?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-rose-500/30 bg-rose-500/5 py-16 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-rose-500/15">
        <AlertCircle className="size-6 text-rose-400" />
      </div>
      <p className="font-medium text-white/90">Failed to load courses</p>
      <p className="mt-1 max-w-md text-sm text-white/55">
        {error?.message ?? "Something went wrong. Please try again."}
      </p>
      {resetErrorBoundary && (
        <Button
          variant="outline"
          size="sm"
          onClick={resetErrorBoundary}
          className="mt-4 gap-1.5 border-rose-500/30 hover:bg-rose-500/10"
        >
          <RotateCcw className="size-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Content — useQuery + keepPreviousData (Netflix/Uber search UX)
// ============================================================================
// `useSuspenseQuery` har queryKey change pe suspend karta hai — typing the
// search box mid-stream would unmount the table → skeleton flash → bad UX.
//
// Pattern (used by Netflix, Linear, Vercel):
//   - `useQuery` (non-suspending)
//   - `placeholderData: keepPreviousData` → previous results stay visible
//     during refetch (smooth, no layout shift)
//   - `isPlaceholderData` → dim the table to signal "stale, updating"
//   - Initial load (no hydrated cache) → inline skeleton
//
// Server-prefetch benefit retained: hydrated cache means first render has
// data already → no loading state on first visit.
// ============================================================================
export function AdminCoursesContent() {
  // One opinionated hook does it all: URL state + debounced search + query
  // + filter helpers + pagination helpers. Admin mode (default) honors the
  // `status` filter so admins can pivot between DRAFT / LIVE / ARCHIVED.
  const {
    data,
    isLoading,
    isFetching,
    isPlaceholderData,
    isError,
    error,
    refetch,
    items,
    pagination,
    hasFilters,
    pageSize,
    searchValue,
    onSearchChange,
    status,
    level,
    sort,
    setStatus,
    setLevel,
    setSort,
    goToPage,
    goNext,
    goPrev,
  } = useCourses();

  return (
    <>
      {/* ─── Search + filters (always visible — never block typing) ─── */}
      <AdminCourseSearch
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        status={status}
        onStatusChange={setStatus}
        level={level}
        onLevelChange={setLevel}
        sort={sort}
        onSortChange={setSort}
      />

      {/* ─── Total count chip — animated pulse while refetching ─── */}
      <div className="flex items-center justify-end">
        <span className="text-xs text-white/45" suppressHydrationWarning>
          {isLoading ? (
            <span className="animate-pulse">Loading…</span>
          ) : pagination ? (
            <>
              {pagination.total} course{pagination.total !== 1 ? "s" : ""}
              {isFetching && (
                <span className="ml-2 inline-block size-1.5 animate-pulse rounded-full bg-[#FF5A1F]" />
              )}
            </>
          ) : null}
        </span>
      </div>

      {/* ─── Table ─────────────────────────────────────────────────────
            Loading rules (Linear/Vercel pattern):
              · isLoading            → no data yet → full skeleton
              · isPlaceholderData    → STALE results while new ones fetch
                (search/filter changed) → also skeleton so user doesn't see
                mismatched rows that don't match their query
              · isFetching only      → revalidation of SAME query (focus,
                etc.) → keep table; row-level dim handled inside the table
            ──────────────────────────────────────────────────────────── */}
      {isLoading || isPlaceholderData ? (
        <AdminCourseTableSkeleton rows={pageSize} />
      ) : isError && !data ? (
        // Only show full error state when we have NO data to fall back on.
        <AdminCoursesError
          error={error as Error}
          resetErrorBoundary={() => refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState searchTerm={searchValue} />
      ) : (
        <AdminCourseTable
          items={items}
          isFetching={isFetching}
          hasFilters={hasFilters}
        />
      )}

      {/* ─── Pagination ─── */}
      {pagination && pagination.totalPages > 0 && (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalCount={pagination.total}
          hasNextPage={pagination.hasNext}
          hasPreviousPage={pagination.hasPrev}
          isFetching={isFetching}
          onPreviousPage={goPrev}
          onNextPage={goNext}
          onPageChange={goToPage}
        />
      )}
    </>
  );
}

function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="flex h-60 items-center justify-center rounded-2xl border border-dashed border-[rgba(255,90,31,0.2)] bg-[rgba(20,12,8,0.3)] text-center text-sm text-white/55">
      {searchTerm
        ? `No courses match "${searchTerm}" — try a different search.`
        : "No courses yet — check back soon."}
    </div>
  );
}
