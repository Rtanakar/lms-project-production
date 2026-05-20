// ============================================================================
// CoursesGrid.tsx — Responsive grid of course cards
// ============================================================================

"use client";

import CourseCard from "./CourseCard";
import type { CourseSummary } from "../types";

interface CoursesGridProps {
  courses: CourseSummary[];
}

export default function CoursesGrid({ courses }: CoursesGridProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-[rgba(255,90,31,0.15)] bg-[rgba(20,12,8,0.4)] p-12 text-center">
        <p className="text-sm text-white/55">
          No courses found. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c, i) => (
        <CourseCard key={c.id} course={c} index={i} />
      ))}
    </div>
  );
}
