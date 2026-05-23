// ============================================================================
// DashboardSkeleton.tsx — pixel-accurate skeleton for /dashboard (staff)
// ============================================================================
// Industry pattern (Linear / Vercel / Netflix admin): every skeleton block
// matches the REAL component layout — paddings, gaps, border-radius,
// icon-slot dimensions, all match. When data lands the only visible change
// is content swapping in, no layout shift, no visual stutter.
//
// Composed of 1:1 mirrors of:
//   • StatCards (StatCardItem layout — icon right, label + value left)
//   • QuickActions (tile = icon top, label + description bottom)
//   • RecentCoursesPanel (header + 5 rows with thumb + title + slug + badge)
//
// Dashboard is ADMIN/INSTRUCTOR only (STUDENT bounced at layout), so the
// skeleton has a single fixed shape — no role branching needed.
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <StatCardsRowSkeleton />
      <QuickActionsRowSkeleton />
      <RecentCoursesPanelSkeleton />
    </div>
  );
}

// ============================================================================
// StatCards row — mirrors components/dashboard/StatCards.tsx
// ============================================================================
// Each card = label (uppercase) + value (2xl bold) on the left, icon
// chip (size-10 rounded-lg) on the right. Border-left accent bar 4px wide.
// ============================================================================
function StatCardsRowSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl border border-l-4 border-[rgba(255,90,31,0.1)] border-l-[rgba(255,90,31,0.18)] bg-[rgba(20,12,8,0.45)] p-5 backdrop-blur"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-24 bg-[rgba(255,90,31,0.08)]" />
              <Skeleton className="h-7 w-16 bg-[rgba(255,90,31,0.08)]" />
            </div>
            <Skeleton className="size-10 shrink-0 rounded-lg bg-[rgba(255,90,31,0.08)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Quick Actions row — mirrors components/dashboard/QuickActions.tsx
// ============================================================================
// Section heading "QUICK ACTIONS" (uppercase tracking-widest) + 4 tiles.
// Tile = icon chip top-left (size-9 gradient), label (text-sm) + description
// (text-[11px]) stacked below.
// ============================================================================
function QuickActionsRowSkeleton() {
  return (
    <section className="space-y-3">
      <Skeleton className="h-3 w-28 bg-[rgba(255,90,31,0.08)]" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex h-full flex-col gap-2 rounded-xl border border-[rgba(255,90,31,0.1)] bg-[rgba(20,12,8,0.45)] p-4 backdrop-blur"
          >
            <Skeleton className="size-9 rounded-lg bg-[rgba(255,90,31,0.1)]" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-20 bg-[rgba(255,90,31,0.08)]" />
              <Skeleton className="h-2.5 w-28 bg-[rgba(255,90,31,0.06)]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// RecentCoursesPanel — mirrors features/dashboard/components/RecentCoursesPanel
// ============================================================================
// Header (h2 + "View all" link) → bordered container → 5 list rows.
// Row = thumbnail (size-12 rounded-md) + title/slug stack + status badge.
// ============================================================================
function RecentCoursesPanelSkeleton() {
  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-32 bg-[rgba(255,90,31,0.08)]" />
        <Skeleton className="h-3 w-16 bg-[rgba(255,90,31,0.08)]" />
      </div>

      <div className="overflow-hidden rounded-xl border border-[rgba(255,90,31,0.1)] bg-[rgba(20,12,8,0.45)] backdrop-blur">
        <ul className="divide-y divide-[rgba(255,90,31,0.08)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-12 shrink-0 rounded-md bg-[rgba(255,90,31,0.08)]" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-[55%] bg-[rgba(255,90,31,0.08)]" />
                <Skeleton className="h-2.5 w-[35%] bg-[rgba(255,90,31,0.06)]" />
              </div>
              <Skeleton className="h-5 w-16 shrink-0 rounded-full bg-[rgba(255,90,31,0.08)]" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
