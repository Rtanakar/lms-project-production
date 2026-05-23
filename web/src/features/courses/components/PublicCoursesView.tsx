// ============================================================================
// PublicCoursesView.tsx — Composed exports for /courses (public marketplace)
// ============================================================================
// Same composition shape as AdminCoursesView so the server page stays thin
// (mirror of the blog reference pattern):
//
//   <PublicCoursesContainer>            ← marketing chrome (hero strip)
//     <HydrateClient>
//       <ErrorBoundary FallbackComponent={PublicCoursesError}>
//         <Suspense fallback={<PublicCoursesLoading />}>
//           <PublicCoursesContent />    ← reads hydrated cache, no flash
//         </Suspense>
//       </ErrorBoundary>
//     </HydrateClient>
//   </PublicCoursesContainer>
//
// State + data flow (identical to admin):
//   • useCourseParams  → nuqs URL state (search/level/sort/page)
//   • useCoursesSearch → 400ms debounced input → URL → query
//   • useQuery + keepPreviousData → previous results stay visible while a
//     new query is in flight; `isPlaceholderData` flips the skeleton on so
//     users never see mismatched rows (search "react" → "nextjs")
//   • PaginationControls at the bottom (smart dropdown ≤10 / input >10)
//
// Public-specific tweaks:
//   • `status` is NEVER sent to the API — backend defaults to public
//     statuses (COMING_SOON / UPCOMING / LIVE / COMPLETED). Public users
//     can't query DRAFT / ARCHIVED.
// ============================================================================

"use client";

import { motion } from "motion/react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/PaginationControls";
import { useCourses } from "../hooks/use-courses";
import { CourseProductCard } from "./CourseProductCard";
import { CourseCardSkeleton } from "./CourseCardSkeleton";
import { PublicCoursesSearch } from "./PublicCoursesSearch";

const EASE = [0.22, 1, 0.36, 1] as const;

// ============================================================================
// Container — marketing chrome (hero strip). Renders sync, before data loads.
// ============================================================================
export function PublicCoursesContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-svh">
      {/* Orange wash backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(255,90,31,0.10),transparent_55%)]"
      />

      <div className="mx-auto w-full max-w-7xl px-5 pt-28 pb-20 md:px-10">
        {/* ─── Hero strip ─── */}
        <header className="flex flex-col gap-4 border-b border-[rgba(255,90,31,0.12)] pb-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex items-center gap-4"
          >
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
              01
            </span>
            <span className="h-px w-12 bg-white/25" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[#FFB07A]">
              Catalog
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="max-w-3xl text-balance text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.03em]"
            style={{
              background:
                "linear-gradient(135deg, #fff 0%, #FFF7EC 60%, #FFB07A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Explore the catalog.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
            className="max-w-xl text-base text-white/60"
          >
            Hand-crafted programs to take you from zero to job-ready. Live
            cohorts, async libraries, and bootcamp-grade builds.
          </motion.p>
        </header>

        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Loading — Suspense fallback (skeleton, matches final layout 1:1)
// ============================================================================
export function PublicCoursesLoading() {
  return (
    <div className="mt-10 space-y-5">
      {/* Search bar skeleton — same height as the real pill input */}
      <div className="flex items-center gap-2">
        <div className="h-12 flex-1 animate-pulse rounded-full bg-[rgba(255,90,31,0.08)]" />
        <div className="h-12 w-28 animate-pulse rounded-full bg-[rgba(255,90,31,0.08)]" />
      </div>
      <div className="flex justify-end">
        <div className="h-3 w-20 animate-pulse rounded bg-[rgba(255,90,31,0.08)]" />
      </div>
      <CourseGridSkeleton count={6} />
    </div>
  );
}

// ============================================================================
// Error — ErrorBoundary fallback
// ============================================================================
export function PublicCoursesError({
  error,
  resetErrorBoundary,
}: {
  error?: Error;
  resetErrorBoundary?: () => void;
}) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5 py-16 text-center">
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
// Content — useQuery + keepPreviousData + admin-style skeleton transitions
// ============================================================================
export function PublicCoursesContent() {
  // Same opinionated hook as admin, with `publicMode: true` so:
  //   • `status` is NEVER sent → backend applies the public allowlist
  //     (COMING_SOON / UPCOMING / LIVE / COMPLETED)
  //   • `setStatus` returned by the hook is intentionally unused on the
  //     public surface (PublicCoursesSearch doesn't expose a status select)
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
    pageSize,
    searchValue,
    onSearchChange,
    level,
    sort,
    setLevel,
    setSort,
    goToPage,
    goNext,
    goPrev,
  } = useCourses({ publicMode: true });

  return (
    <div className="mt-10 space-y-5">
      {/* ─── Search + filters (always visible — never block typing) ─── */}
      <PublicCoursesSearch
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        level={level}
        onLevelChange={setLevel}
        sort={sort}
        onSortChange={setSort}
      />

      {/* ─── Count chip — pulse dot during refetch (admin parity) ─── */}
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

      {/* ─── Grid ──────────────────────────────────────────────────────
            · isLoading            → no data → full skeleton
            · isPlaceholderData    → search/filter/page change → skeleton
              (stale rows would mismatch the new query)
            · isFetching only      → background revalidation → keep grid
            ────────────────────────────────────────────────────────── */}
      {isLoading || isPlaceholderData ? (
        <CourseGridSkeleton count={pageSize} />
      ) : isError && !data ? (
        <PublicCoursesError
          error={error as Error}
          resetErrorBoundary={() => refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState searchTerm={searchValue} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((course, i) => (
            <CourseProductCard key={course.id} course={course} index={i} />
          ))}
        </div>
      )}

      {/* ─── Pagination (PaginationControls — same as admin) ─── */}
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
    </div>
  );
}

// ─── Shared subviews ───────────────────────────────────────────────────────

export function CourseGridSkeleton({
  count,
  variant = "price",
}: {
  count: number;
  variant?: "price" | "progress";
}) {
  // Cap to keep the skeleton sane on huge pageSizes.
  const n = Math.min(Math.max(count, 6), 12);
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => (
        <CourseCardSkeleton key={i} variant={variant} />
      ))}
    </div>
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
