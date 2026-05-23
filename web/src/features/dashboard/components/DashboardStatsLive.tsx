// ============================================================================
// DashboardStatsLive.tsx — staff stat cards backed by live API counts
// ============================================================================
// Reads the THREE prefetched courses queries (totalAll / live / upcoming)
// via `useSuspenseQueries` so we batch them in TanStack's parallel scheduler.
// Each query was warmed server-side → cache hit on first paint → zero
// loading flash. Background refetch (window focus, etc.) updates the
// numbers without disrupting the user.
//
// Dashboard is ADMIN/INSTRUCTOR only (STUDENTs are bounced at the layout),
// so no role branching at the data layer — just label/icon copy differs.
//
// Hardcoded mocks are clearly marked — they'll swap to real hooks when
// the relevant model lands (revenue/certificates need their own tables;
// instructor-scoped queries need backend `?instructorId=me` support).
// ============================================================================

"use client";

import { useSuspenseQueries } from "@tanstack/react-query";
import { STALE_TIME } from "@/config/constants";
import { courseKeys } from "@/features/courses/api/course-keys";
import { fetchCourses } from "@/features/courses/api/courses-api";
import { StatCards, type StatCardItem } from "@/components/dashboard/StatCards";
import type { StaffRole } from "@/lib/helpers/auth-helpers";
import { DASHBOARD_QUERIES } from "../server/queries";

interface DashboardStatsLiveProps {
  role: StaffRole;
}

export function DashboardStatsLive({ role }: DashboardStatsLiveProps) {
  // useSuspenseQueries throws the promise → outer <Suspense> renders
  // DashboardSkeleton until all three resolve (or hits prefetched cache).
  const [totalQ, liveQ, upcomingQ] = useSuspenseQueries({
    queries: [
      {
        queryKey: courseKeys.list(DASHBOARD_QUERIES.totalAll),
        queryFn: () => fetchCourses(DASHBOARD_QUERIES.totalAll),
        staleTime: STALE_TIME.LIST,
      },
      {
        queryKey: courseKeys.list(DASHBOARD_QUERIES.live),
        queryFn: () => fetchCourses(DASHBOARD_QUERIES.live),
        staleTime: STALE_TIME.LIST,
      },
      {
        queryKey: courseKeys.list(DASHBOARD_QUERIES.upcoming),
        queryFn: () => fetchCourses(DASHBOARD_QUERIES.upcoming),
        staleTime: STALE_TIME.LIST,
      },
    ],
  });

  const stats = buildStaffStats({
    role,
    totalCount: totalQ.data.pagination.total,
    liveCount: liveQ.data.pagination.total,
    upcomingCount: upcomingQ.data.pagination.total,
  });

  return <StatCards stats={stats} />;
}

// ============================================================================
// buildStaffStats — pure mapper, role-specific labels
// ============================================================================
function buildStaffStats({
  role,
  totalCount,
  liveCount,
  upcomingCount,
}: {
  role: StaffRole;
  totalCount: number;
  liveCount: number;
  upcomingCount: number;
}): StatCardItem[] {
  if (role === "ADMIN") {
    return [
      {
        label: "Total Courses",
        value: totalCount,
        icon: "BookOpen",
        accent: "orange",
      },
      {
        label: "Live Now",
        value: liveCount,
        icon: "PlaySquare",
        accent: "rose",
      },
      {
        label: "Upcoming",
        value: upcomingCount,
        icon: "TrendingUp",
        accent: "blue",
      },
      // Revenue + Certificates need their own tables — mock until then.
      {
        label: "Revenue (₹)",
        value: "—",
        icon: "TrendingUp",
        accent: "emerald",
      },
    ];
  }

  // INSTRUCTOR — currently shows global total. When backend supports
  // `?instructorId=me`, swap the prefetch query to scope per-instructor.
  return [
    {
      label: "Your Courses",
      value: totalCount,
      icon: "BookOpen",
      accent: "orange",
    },
    {
      label: "Live Now",
      value: liveCount,
      icon: "PlaySquare",
      accent: "rose",
    },
    {
      label: "Upcoming",
      value: upcomingCount,
      icon: "TrendingUp",
      accent: "blue",
    },
    // Enrollment + rating need Enrollment / Review tables — mock.
    {
      label: "Avg. Rating",
      value: "—",
      icon: "Award",
      accent: "emerald",
    },
  ];
}
