// ============================================================================
// RecentCoursesPanel.tsx — last 5 courses, status badge, jump-to-edit
// ============================================================================
// ADMIN / INSTRUCTOR see the cross-status "recent" list (DRAFT included so
// they can pick back up where they left off). Each row links to the edit
// view. Empty + error states mirror the table pattern from
// AdminCoursesTable for consistency.
// ============================================================================

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STALE_TIME } from "@/config/constants";
import { courseKeys } from "@/features/courses/api/course-keys";
import { fetchCourses } from "@/features/courses/api/courses-api";
import { COURSE_STATUS_META } from "@/features/courses/types";
import { DASHBOARD_QUERIES } from "../server/queries";

export function RecentCoursesPanel() {
  // Suspense query — outer Suspense renders DashboardSkeleton until resolved.
  // Server prefetch warms the cache so this is usually a cache hit, no flash.
  const { data, isError } = useSuspenseQuery({
    queryKey: courseKeys.list(DASHBOARD_QUERIES.recent),
    queryFn: () => fetchCourses(DASHBOARD_QUERIES.recent),
    staleTime: STALE_TIME.LIST,
  });

  const items = data.items;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/45">
          Recent courses
        </h2>
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#FFB07A] transition-colors hover:text-white"
        >
          View all
          <ArrowUpRight className="size-3" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[rgba(255,90,31,0.1)] bg-[rgba(20,12,8,0.45)] backdrop-blur">
        {isError ? (
          <p className="px-5 py-8 text-center text-sm text-rose-300">
            Couldn&apos;t load recent courses.
          </p>
        ) : items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-white/55">
            No courses yet — create your first to get started.
          </p>
        ) : (
          <ul className="divide-y divide-[rgba(255,90,31,0.08)]">
            {items.map((course, i) => (
              <motion.li
                key={course.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <Link
                  href={`/dashboard/courses/${course.slug}/edit`}
                  className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[rgba(255,90,31,0.04)]"
                >
                  {/* Thumb */}
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-[rgba(255,90,31,0.12)] bg-[rgba(255,90,31,0.05)]">
                    {course.thumbnailUrl || course.coverImageUrl ? (
                      <Image
                        src={
                          (course.thumbnailUrl ||
                            course.coverImageUrl) as string
                        }
                        alt={course.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="size-4 text-white/30" />
                      </div>
                    )}
                  </div>

                  {/* Title + slug */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white/90 transition-colors group-hover:text-[#FFB07A]">
                      {course.title}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-white/40">
                      /{course.slug}
                    </p>
                  </div>

                  {/* Status badge */}
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-[10px] font-medium",
                      COURSE_STATUS_META[course.status].tone,
                    )}
                  >
                    {COURSE_STATUS_META[course.status].label}
                  </Badge>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

