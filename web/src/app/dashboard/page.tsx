// ============================================================================
// /dashboard — server component (ADMIN/INSTRUCTOR home, live courses data)
// ============================================================================
// Thin server component (blog / admin pattern):
//   1. requireRole(ADMIN, INSTRUCTOR) → ensure session + gate role
//      (STUDENT is bounced to /my-courses by both the layout and this helper)
//   2. prefetchDashboard() → warm total / live / upcoming counts + recent-5
//   3. Compose Container · HydrateClient · ErrorBoundary · Suspense · Content
//
// All live data hooks live in `features/dashboard/components/*Live.tsx`
// reading the same query keys the prefetch warmed → cache hit, zero flash.
// ============================================================================

import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { requireRole } from "@/lib/helpers/auth-helpers";
import { HydrateClient } from "@/lib/hydrate-client";
import { prefetchDashboard } from "@/features/dashboard/server/prefetch";
import {
  DashboardContainer,
  DashboardContent,
  DashboardError,
  DashboardLoading,
} from "@/features/dashboard/views/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await requireRole("ADMIN", "INSTRUCTOR");
  const user = session.user as typeof session.user & {
    role: "ADMIN" | "INSTRUCTOR";
  };

  // Fire-and-forget — Suspense awaits via HydrationBoundary.
  prefetchDashboard();

  return (
    <DashboardContainer user={{ name: user.name, role: user.role }}>
      <HydrateClient>
        <ErrorBoundary fallback={<DashboardError />}>
          <Suspense fallback={<DashboardLoading />}>
            <DashboardContent role={user.role} />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </DashboardContainer>
  );
}
