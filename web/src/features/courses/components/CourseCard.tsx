// ============================================================================
// CourseCard.tsx — Browser-window-styled course card (Sheryians-signature)
// ============================================================================
// Iss design ka key element: top bar with 3 colored "window dots" — looks like
// a macOS window. Inside the "window" goes the cover image. Below: tags,
// title, price, CTA.
//
// Hover effect: lift + orange glow + slight scale on image.
// ============================================================================

"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseSummary } from "../types";

interface CourseCardProps {
  course: CourseSummary;
  /** Stagger index — for entry animation delay */
  index?: number;
}

export default function CourseCard({ course, index = 0 }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link href={`/courses/${course.slug}`} className="block">
        {/* ─── Browser-window frame ─── */}
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-[rgba(255,90,31,0.12)] bg-[rgba(15,10,7,0.55)] backdrop-blur",
            "transition-all duration-300",
            "group-hover:border-[rgba(255,90,31,0.45)] group-hover:shadow-[0_24px_60px_-20px_rgba(224,74,18,0.45)]",
          )}
        >
          {/* Window controls bar */}
          <div className="flex items-center gap-1.5 border-b border-[rgba(255,90,31,0.08)] bg-[rgba(0,0,0,0.4)] px-3 py-2.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>

          {/* Cover image (mock = gradient; real = next/image later) */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{ background: course.coverImage }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
            />

            {/* Vignette to make text more readable */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
              }}
            />

            {/* LIVE badge */}
            {course.status === "LIVE" && (
              <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-300 backdrop-blur">
                <span className="size-1.5 animate-pulse rounded-full bg-rose-400 shadow-[0_0_6px_#f87171]" />
                Live
              </span>
            )}
            {course.status === "UPCOMING" && (
              <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300 backdrop-blur">
                Upcoming
              </span>
            )}
            {course.status === "COMPLETED" && (
              <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300 backdrop-blur">
                Completed
              </span>
            )}

            {/* Stats overlay bottom */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 text-[11px] font-medium text-white/85">
              <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 backdrop-blur">
                <Star className="size-3 fill-[#FFB07A] stroke-[#FFB07A]" />
                {course.rating.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 backdrop-blur">
                <Users className="size-3" />
                {formatStudents(course.studentsEnrolled)}
              </span>
            </div>
          </div>

          {/* Card body */}
          <div className="space-y-4 p-5">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <span
                  key={tag.label}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                    tag.tone === "accent"
                      ? "border-[rgba(255,90,31,0.35)] bg-[rgba(255,90,31,0.08)] text-[#FFB07A]"
                      : tag.tone === "success"
                        ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-300"
                        : "border-white/10 bg-white/5 text-white/70",
                  )}
                >
                  {tag.label}
                </span>
              ))}
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h3 className="text-xl font-bold leading-tight tracking-tight text-white transition-colors group-hover:text-[#FFB07A]">
                {course.title}
              </h3>
              {course.subtitle && (
                <p className="text-sm leading-relaxed text-white/50">
                  {course.subtitle}
                </p>
              )}
            </div>

            {/* Price row */}
            <div className="flex items-end justify-between gap-3 border-t border-[rgba(255,90,31,0.08)] pt-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
                    Price
                  </span>
                  <span className="text-2xl font-bold text-[#FF5A1F]">
                    ₹{formatPrice(course.price)}
                  </span>
                  <span className="text-sm text-white/35 line-through">
                    ₹{formatPrice(course.originalPrice)}
                  </span>
                </div>
                <span className="mt-1 inline-block rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                  {course.discountPercent}% off
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between border-t border-[rgba(255,90,31,0.08)] pt-4">
              <span className="text-xs text-white/40">
                {course.durationHours}h · {course.level}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF5A1F] transition-all group-hover:gap-2.5 group-hover:text-[#FFB07A]">
                Check Course
                <ArrowRight className="size-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Utility formatters ─────
function formatPrice(n: number): string {
  return n.toLocaleString("en-IN");
}

function formatStudents(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}
