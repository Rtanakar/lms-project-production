// ============================================================================
// DashboardView.tsx — composed exports for /dashboard (ADMIN/INSTRUCTOR home)
// ============================================================================
// Same 4-export pattern used by AdminCoursesView / PublicCoursesView so the
// server page stays declarative:
//
//   <DashboardContainer>
//     <HydrateClient>
//       <ErrorBoundary FallbackComponent={DashboardError}>
//         <Suspense fallback={<DashboardLoading />}>
//           <DashboardContent role={role} />
//         </Suspense>
//       </ErrorBoundary>
//     </HydrateClient>
//   </DashboardContainer>
//
// STUDENT role does NOT reach here — the /dashboard layout redirects them
// to /my-courses (their marketing-side home).
//
// All courses-derived data comes through the same `useCourses`/`useQuery`
// hooks as the rest of the app — server prefetch warms the cache, client
// renders without a flash.
// ============================================================================

"use client";

import { motion } from "motion/react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuickActions } from "@/components/dashboard/QuickActions";
import type { StaffRole } from "@/lib/helpers/auth-helpers";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { DashboardStatsLive } from "../components/DashboardStatsLive";
import { RecentCoursesPanel } from "../components/RecentCoursesPanel";

const EASE = [0.22, 1, 0.36, 1] as const;

// ============================================================================
// Container — chrome (heading + tagline). Renders sync, before data lands.
// ============================================================================
export function DashboardContainer({
  user,
  children,
}: {
  user: { name: string | null; role: StaffRole };
  children: React.ReactNode;
}) {
  const heading =
    user.role === "ADMIN" ? "Admin overview" : "Instructor dashboard";

  const subline =
    user.role === "ADMIN"
      ? "Platform-wide metrics & quick controls."
      : "Your courses, students, and earnings at a glance.";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
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
            {heading}
          </h1>
        </div>
        <p className="mt-1 ml-3 text-sm text-white/55">{subline}</p>
      </motion.div>

      {children}
    </div>
  );
}

// ============================================================================
// Loading — Suspense fallback. Delegates to DashboardSkeleton (pixel-accurate
// 1:1 mirror of the real components → zero layout shift on hydrate).
// ============================================================================
export function DashboardLoading() {
  return <DashboardSkeleton />;
}

// ============================================================================
// Error — ErrorBoundary fallback
// ============================================================================
export function DashboardError({
  error,
  resetErrorBoundary,
}: {
  error?: Error;
  resetErrorBoundary?: () => void;
}) {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Card className="max-w-md border-rose-500/30 bg-rose-500/5">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-rose-500/15">
            <AlertCircle className="size-7 text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white/90">
              Something went wrong
            </h3>
            <p className="mt-1 text-sm text-white/55">
              {error?.message ?? "Failed to load dashboard. Please try again."}
            </p>
          </div>
          {resetErrorBoundary && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetErrorBoundary}
              className="gap-2 border-rose-500/30 hover:bg-rose-500/10"
            >
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Content — actual dashboard body (ADMIN/INSTRUCTOR)
// ============================================================================
export function DashboardContent({ role }: { role: StaffRole }) {
  return (
    <>
      <DashboardStatsLive role={role} />
      <QuickActions role={role} />
      <RecentCoursesPanel />
    </>
  );
}
