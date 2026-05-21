// ============================================================================
// /dashboard — server component (role-aware home)
// ============================================================================
// Renders different content based on user role. Stat data is hardcoded for
// now — D2 me real API se replace karenge (TanStack Query hooks).
// ============================================================================

import type { Metadata } from "next";
import { requireAuth } from "@/lib/helpers/auth-helpers";
import { StatCards, type StatCardItem } from "@/components/dashboard/StatCards";
import { QuickActions } from "@/components/dashboard/QuickActions";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const { user } = session;

  // ─── Mock stats — D2 me real API se replace ───
  // Role ke hisaab se different stats dikhana hai
  const stats: StatCardItem[] = (() => {
    if (user.role === "ADMIN") {
      return [
        {
          label: "Total Courses",
          value: 42,
          delta: 12,
          deltaLabel: "vs last week",
          icon: "BookOpen",
          accent: "orange",
        },
        {
          label: "Active Students",
          value: "12,480",
          delta: 8,
          deltaLabel: "vs last week",
          icon: "Users",
          accent: "blue",
        },
        {
          label: "Revenue (₹)",
          value: "8.2L",
          delta: 23,
          deltaLabel: "this month",
          icon: "TrendingUp",
          accent: "emerald",
        },
        {
          label: "Certificates",
          value: 1240,
          delta: -3,
          deltaLabel: "vs last week",
          icon: "Award",
          accent: "rose",
        },
      ];
    }
    if (user.role === "INSTRUCTOR") {
      return [
        {
          label: "Your Courses",
          value: 3,
          icon: "BookOpen",
          accent: "orange",
        },
        {
          label: "Students",
          value: "1,240",
          delta: 12,
          deltaLabel: "vs last week",
          icon: "Users",
          accent: "blue",
        },
        {
          label: "Earnings (₹)",
          value: "84K",
          delta: 18,
          deltaLabel: "this month",
          icon: "TrendingUp",
          accent: "emerald",
        },
        {
          label: "Avg. Rating",
          value: "4.8",
          icon: "Award",
          accent: "rose",
        },
      ];
    }
    // STUDENT
    return [
      {
        label: "Enrolled",
        value: 4,
        icon: "BookOpen",
        accent: "orange",
      },
      {
        label: "In Progress",
        value: 2,
        icon: "PlaySquare",
        accent: "blue",
      },
      {
        label: "Hours Watched",
        value: 18,
        icon: "GraduationCap",
        accent: "emerald",
      },
      {
        label: "Certificates",
        value: 1,
        icon: "Award",
        accent: "rose",
      },
    ];
  })();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 lg:p-6">
      {/* ─── Page title ─── */}
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
            {user.role === "ADMIN"
              ? "Admin overview"
              : user.role === "INSTRUCTOR"
                ? "Instructor dashboard"
                : "Welcome back"}
          </h1>
        </div>
        <p className="mt-1 ml-3 text-sm text-white/55">
          {user.role === "ADMIN"
            ? "Platform-wide metrics & quick controls."
            : user.role === "INSTRUCTOR"
              ? "Your courses, students, and earnings at a glance."
              : "Track your learning progress and discover new courses."}
        </p>
      </div>

      {/* ─── Stat cards ─── */}
      <StatCards stats={stats} />

      {/* ─── Quick actions ─── */}
      <QuickActions role={user.role} />

      {/* ─── Placeholder for charts / recent activity (D2+) ─── */}
      <section className="rounded-xl border border-[rgba(255,90,31,0.1)] bg-[rgba(20,12,8,0.45)] p-6 backdrop-blur">
        <p className="text-sm text-white/55">
          📊 Charts, recent activity, and course list coming in Sub-phase{" "}
          <span className="font-semibold text-[#FFB07A]">D2</span> (real API
          integration with TanStack Query + nuqs).
        </p>
      </section>
    </div>
  );
}
