// ============================================================================
// MyCoursesView.tsx — Composed exports for /my-courses (student's library)
// ============================================================================
// Same shell as PublicCoursesView, with two divergences:
//   1. Sign-in gate — anon users see CTA instead of the grid
//   2. Each card receives a MOCK CourseProgress so the post-purchase variant
//      (progress bar + chapters + Continue CTA) renders. Phase 11.6 will
//      swap this for a real `useMyEnrollments` hook; the card itself
//      doesn't change.
// ============================================================================

"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { AlertCircle, LogIn, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/PaginationControls";
import { useSession } from "@/lib/auth-client";
import { useCourses } from "../hooks/use-courses";
import {
  CourseProductCard,
  type CourseProgress,
} from "./CourseProductCard";
import { CourseGridSkeleton } from "./PublicCoursesView";
import { PublicCoursesSearch } from "./PublicCoursesSearch";

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Mock progress — cycled per index until Enrollment model lands ─────────
const MOCK_PROGRESS: CourseProgress[] = [
  { percentComplete: 100, chaptersTotal: 4 },
  { percentComplete: 50, chaptersTotal: 2 },
  { percentComplete: 30, chaptersTotal: 10 },
  { percentComplete: 17, chaptersTotal: 6 },
  { percentComplete: 0, chaptersTotal: 12 },
  { percentComplete: 75, chaptersTotal: 8 },
];

// ============================================================================
// Container — same hero chrome, swapped copy ("My Learning")
// ============================================================================
export function MyCoursesContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-svh">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(255,90,31,0.10),transparent_55%)]"
      />

      <div className="mx-auto w-full max-w-7xl px-5 pt-28 pb-20 md:px-10">
        <header className="flex flex-col gap-4 border-b border-[rgba(255,90,31,0.12)] pb-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex items-center gap-4"
          >
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
              02
            </span>
            <span className="h-px w-12 bg-white/25" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[#FFB07A]">
              My Learning
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
            Continue where you left off.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
            className="max-w-xl text-base text-white/60"
          >
            Track progress, finish what you started, and earn certificates as
            you go.
          </motion.p>
        </header>

        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Loading — Suspense fallback (progress-variant skeleton)
// ============================================================================
export function MyCoursesLoading() {
  return (
    <div className="mt-10 space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-12 flex-1 animate-pulse rounded-full bg-[rgba(255,90,31,0.08)]" />
        <div className="h-12 w-28 animate-pulse rounded-full bg-[rgba(255,90,31,0.08)]" />
      </div>
      <div className="flex justify-end">
        <div className="h-3 w-20 animate-pulse rounded bg-[rgba(255,90,31,0.08)]" />
      </div>
      <CourseGridSkeleton count={6} variant="progress" />
    </div>
  );
}

// ============================================================================
// Error — same shape as PublicCoursesError, separate so it can be tracked
// (different page in analytics) and themed independently later if needed.
// ============================================================================
export function MyCoursesError({
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
      <p className="font-medium text-white/90">Failed to load your courses</p>
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
// Content — sign-in gate + admin-style query flow + mock progress overlay
// ============================================================================
export function MyCoursesContent() {
  // Anon gate is a top-level branch BEFORE the courses hook runs. We
  // intentionally avoid firing the data query for visitors who aren't
  // signed in — they see the CTA instead. Once `useMyEnrollments` exists
  // (Phase 11.6), the inner component will swap to it and the public list
  // hook here goes away.
  const { data: session, isPending: sessionLoading } = useSession();

  if (!sessionLoading && !session?.user) {
    return <SignInRequired />;
  }
  if (sessionLoading) {
    // Session resolving — keep the UI quiet (Suspense already painted the
    // skeleton). Returning null is fine because the Suspense fallback owns
    // this frame.
    return null;
  }

  return <MyCoursesContentInner />;
}

// ─── Inner — only mounts after the anon gate passes ───────────────────────
function MyCoursesContentInner() {
  // Same opinionated hook as the public marketplace — `publicMode: true`
  // so we never request DRAFT/ARCHIVED. The card variant is overridden by
  // passing `progress` (mock for now).
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
      <PublicCoursesSearch
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        level={level}
        onLevelChange={setLevel}
        sort={sort}
        onSortChange={setSort}
      />

      <div className="flex items-center justify-end">
        <span className="text-xs text-white/45" suppressHydrationWarning>
          {isLoading ? (
            <span className="animate-pulse">Loading…</span>
          ) : pagination ? (
            <>
              {pagination.total} enrolled
              {isFetching && (
                <span className="ml-2 inline-block size-1.5 animate-pulse rounded-full bg-[#FF5A1F]" />
              )}
            </>
          ) : null}
        </span>
      </div>

      {isLoading || isPlaceholderData ? (
        <CourseGridSkeleton count={pageSize} variant="progress" />
      ) : isError && !data ? (
        <MyCoursesError
          error={error as Error}
          resetErrorBoundary={() => refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyEnrollments />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((course, i) => (
            <CourseProductCard
              key={course.id}
              course={course}
              progress={MOCK_PROGRESS[i % MOCK_PROGRESS.length]}
              index={i}
            />
          ))}
        </div>
      )}

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

// ─── Subviews ──────────────────────────────────────────────────────────────

function EmptyEnrollments() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(255,90,31,0.2)] bg-[rgba(20,12,8,0.3)] py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[rgba(255,90,31,0.1)]">
        <Sparkles className="size-6 text-[#FFB07A]" />
      </div>
      <p className="font-semibold text-white/90">No enrollments yet</p>
      <p className="mt-1 max-w-md text-sm text-white/55">
        Browse the catalog and add a course to your cart to get started.
      </p>
      <Button
        asChild
        className="mt-5 shadow-lg shadow-[rgba(224,74,18,0.3)]"
        style={{ background: "linear-gradient(135deg,#FF5A1F,#E04A12)" }}
      >
        <Link href="/courses">Explore courses</Link>
      </Button>
    </div>
  );
}

function SignInRequired() {
  return (
    <div className="mx-auto mt-12 flex max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[rgba(255,90,31,0.1)]">
          <LogIn className="size-6 text-[#FFB07A]" />
        </div>
        <h2 className="text-2xl font-bold text-white/95">
          Sign in to see your courses
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Your enrolled courses, progress, and certificates live here once
          you&apos;re signed in.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button
            asChild
            className="shadow-lg shadow-[rgba(224,74,18,0.3)]"
            style={{ background: "linear-gradient(135deg,#FF5A1F,#E04A12)" }}
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/courses">Browse courses</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
