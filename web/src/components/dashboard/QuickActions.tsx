// ============================================================================
// QuickActions.tsx — Quick action tiles based on role
// ============================================================================

"use client";

import Link from "next/link";
import {
  Plus,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/helpers/auth-helpers";

const ICON_MAP = { Plus, BookOpen, Users, BarChart3, Settings } as const;
type IconName = keyof typeof ICON_MAP;

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: IconName;
  accent: string;
}

const adminActions: QuickAction[] = [
  {
    label: "Create Course",
    description: "New course or cohort",
    href: "/dashboard/courses/new",
    icon: "Plus",
    accent: "from-[#FF5A1F] to-[#E04A12]",
  },
  {
    label: "All Courses",
    description: "Manage & publish",
    href: "/dashboard/courses",
    icon: "BookOpen",
    accent: "from-blue-500 to-blue-600",
  },
  {
    label: "Users",
    description: "Students & instructors",
    href: "/dashboard/users",
    icon: "Users",
    accent: "from-emerald-500 to-emerald-600",
  },
  {
    label: "Analytics",
    description: "Revenue & engagement",
    href: "/dashboard/analytics",
    icon: "BarChart3",
    accent: "from-purple-500 to-purple-600",
  },
];

const instructorActions: QuickAction[] = [
  {
    label: "New Course",
    description: "Draft a course",
    href: "/dashboard/courses/new",
    icon: "Plus",
    accent: "from-[#FF5A1F] to-[#E04A12]",
  },
  {
    label: "My Courses",
    description: "Edit content",
    href: "/dashboard/courses",
    icon: "BookOpen",
    accent: "from-blue-500 to-blue-600",
  },
  {
    label: "Students",
    description: "Track progress",
    href: "/dashboard/students",
    icon: "Users",
    accent: "from-emerald-500 to-emerald-600",
  },
  {
    label: "Settings",
    description: "Payouts & profile",
    href: "/dashboard/settings",
    icon: "Settings",
    accent: "from-slate-500 to-slate-600",
  },
];

const studentActions: QuickAction[] = [
  {
    label: "Browse Courses",
    description: "Discover new skills",
    href: "/courses",
    icon: "BookOpen",
    accent: "from-[#FF5A1F] to-[#E04A12]",
  },
  {
    label: "My Learning",
    description: "Continue where you left off",
    href: "/dashboard/my-courses",
    icon: "BookOpen",
    accent: "from-blue-500 to-blue-600",
  },
];

function getActionsForRole(role: Role): QuickAction[] {
  switch (role) {
    case "ADMIN":
      return adminActions;
    case "INSTRUCTOR":
      return instructorActions;
    case "STUDENT":
    default:
      return studentActions;
  }
}

export function QuickActions({ role }: { role: Role }) {
  const actions = getActionsForRole(role);

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-white/45">
        Quick actions
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action, i) => {
          // ✅ String se icon resolve karo — Client side pe
          const Icon: LucideIcon = ICON_MAP[action.icon];

          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link
                href={action.href}
                className={cn(
                  "group flex h-full flex-col gap-2 rounded-xl border border-[rgba(255,90,31,0.1)] bg-[rgba(20,12,8,0.45)] p-4 backdrop-blur",
                  "transition-all hover:-translate-y-0.5 hover:border-[rgba(255,90,31,0.3)] hover:bg-[rgba(255,90,31,0.06)] hover:shadow-[0_8px_30px_rgba(224,74,18,0.15)]",
                )}
              >
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg bg-linear-to-br shadow-lg",
                    action.accent,
                  )}
                >
                  {/* ✅ action.icon nahi — resolved Icon use karo */}
                  <Icon className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {action.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/50">
                    {action.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
