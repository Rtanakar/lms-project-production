// ============================================================================
// CourseProductCard.tsx — purchase-aware course card
// ============================================================================
// One unified card. Variant decided by `progress`:
//
//   • `progress` undefined  →  Pre-purchase variant
//                              ─────────────────────
//                              Thumbnail · tags · title · rating · price (+
//                              strike-through original) · "Add to cart" CTA
//                              (or "Go to cart" when already in cart) ·
//                              "Check Course" link
//
//   • `progress` provided   →  Post-purchase / enrolled variant
//                              ────────────────────────────────
//                              Thumbnail · title · chapters count ·
//                              progress bar (X% Complete) · "Continue" CTA
//                              No price, no add-to-cart.
//
// This mirrors the Udemy / Coursera pattern: the same logical course renders
// differently on the marketplace vs the "My Learning" page.
//
// Data source: real backend `CourseListItem` (not mock). Progress is a
// separate optional shape — fetched / mocked / hydrated by the parent page
// based on enrollment state.
// ============================================================================

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Check,
  PlayCircle,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore, useIsInCart } from "@/features/cart/store/cart-store";
import { COURSE_STATUS_META, type CourseListItem } from "../types";

// ============================================================================
// Progress shape — kept minimal so the page can fetch from any source
// (mock / real enrollment API / TanStack Query) and pass through.
// ============================================================================
export interface CourseProgress {
  /** 0–100 inclusive — what fraction of lessons the user has completed */
  percentComplete: number;
  /** Number of chapters/modules total — display only */
  chaptersTotal: number;
  /** Optional — last opened lesson for "Continue from where you left off" */
  resumeHref?: string;
}

interface CourseProductCardProps {
  course: CourseListItem;
  /** When set → card switches to enrolled/progress variant */
  progress?: CourseProgress;
  /** Stagger index for entry animation */
  index?: number;
}

// ============================================================================
// Currency formatter (mirrors AdminCoursesTable)
// ============================================================================
function fmtPrice(n: number, currency: string) {
  if (currency === "INR") return `₹${n.toLocaleString("en-IN")}`;
  return `${currency} ${n.toLocaleString()}`;
}

function fmtStudents(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

// ============================================================================
// Card
// ============================================================================
export function CourseProductCard({
  course,
  progress,
  index = 0,
}: CourseProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useIsInCart()(course.id);
  const isPurchased = !!progress;

  function handleAdd() {
    addItem({
      courseId: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      thumbnailUrl: course.thumbnailUrl ?? course.coverImageUrl,
      price: course.price,
      originalPrice: course.originalPrice,
      currency: course.currency,
    });
    // Industry pattern (Udemy/Coursera): brief confirmation with the title
    // truncated, no action button (cart icon in the nav is already there).
    toast.success("Added to cart", {
      description: course.title,
      duration: 2500,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-2xl border bg-[rgba(15,10,7,0.55)] backdrop-blur transition-all duration-300",
          "border-[rgba(255,90,31,0.12)]",
          "group-hover:border-[rgba(255,90,31,0.45)] group-hover:shadow-[0_24px_60px_-20px_rgba(224,74,18,0.45)]",
        )}
      >
        {/* ─── Cover image — clickable to detail ─── */}
        <Link
          href={`/courses/${course.slug}`}
          className="relative block aspect-16/10 overflow-hidden bg-black/40"
        >
          {course.coverImageUrl || course.thumbnailUrl ? (
            <Image
              src={(course.coverImageUrl || course.thumbnailUrl) as string}
              alt={course.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="size-10 text-white/15" />
            </div>
          )}

          {/* Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
            }}
          />

          {/* ─── Top-right status badge ──────────────────────────────────
              Priority order:
                1. Purchased + 100% done → "Completed" override (the LEARNING
                   status, not the course's lifecycle status — user cares
                   about their own progress here)
                2. Otherwise → course.status from backend, via shared
                   COURSE_STATUS_META map (Draft / Coming Soon / Upcoming /
                   Live / Completed / Archived). LIVE gets the pulsing dot
                   for extra emphasis.
              We hide DRAFT on public cards to avoid leaking unfinished
              content if it ever slips into a list response. */}
          {isPurchased && progress.percentComplete === 100 ? (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300 backdrop-blur">
              <Check className="size-3" />
              Completed
            </span>
          ) : (
            course.status !== "DRAFT" && (
              <span
                className={cn(
                  "absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur",
                  COURSE_STATUS_META[course.status].tone,
                )}
              >
                {course.status === "LIVE" && (
                  <span className="size-1.5 animate-pulse rounded-full bg-rose-400 shadow-[0_0_6px_#f87171]" />
                )}
                {COURSE_STATUS_META[course.status].label}
              </span>
            )
          )}

          {/* Stats overlay (pre-purchase only — students/rating less useful
              after enrollment where progress is the focus). */}
          {!isPurchased && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-[11px] font-medium text-white/90">
              {course.rating > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 backdrop-blur">
                  <Star className="size-3 fill-[#FFB07A] stroke-[#FFB07A]" />
                  {course.rating.toFixed(1)}
                </span>
              )}
              {course.studentsEnrolled > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 backdrop-blur">
                  <Users className="size-3" />
                  {fmtStudents(course.studentsEnrolled)}
                </span>
              )}
            </div>
          )}
        </Link>

        {/* ─── Body ─── */}
        <div className="flex flex-1 flex-col gap-4 p-5">
          {/* Tags (pre-purchase only — purchased page focuses on progress) */}
          {!isPurchased && course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {course.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[rgba(255,90,31,0.25)] bg-[rgba(255,90,31,0.06)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[#FFB07A]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <Link href={`/courses/${course.slug}`} className="block">
            <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-[#FFB07A]">
              {course.title}
            </h3>
            {course.subtitle && !isPurchased && (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/55">
                {course.subtitle}
              </p>
            )}
          </Link>

          {/* ─── Variant divergence ─── */}
          {isPurchased ? (
            <PurchasedFooter
              course={course}
              progress={progress}
              chaptersTotal={progress.chaptersTotal}
            />
          ) : (
            <UnpurchasedFooter
              course={course}
              isInCart={isInCart}
              onAdd={handleAdd}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Pre-purchase footer — price + add to cart + check course
// ============================================================================
function UnpurchasedFooter({
  course,
  isInCart,
  onAdd,
}: {
  course: CourseListItem;
  isInCart: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="mt-auto space-y-4 border-t border-[rgba(255,90,31,0.08)] pt-4">
      {/* Price row */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#FF5A1F]">
            {fmtPrice(course.price, course.currency)}
          </span>
          {course.originalPrice > course.price && (
            <>
              <span className="text-sm text-white/35 line-through">
                {fmtPrice(course.originalPrice, course.currency)}
              </span>
              {course.discountPercent > 0 && (
                <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                  {course.discountPercent}% off
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Meta + CTA row */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/45">
          {course.durationHours > 0 && `${course.durationHours}h · `}
          {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
        </span>
        <Button
          type="button"
          size="sm"
          onClick={onAdd}
          disabled={isInCart}
          className={cn(
            "ml-auto h-9 gap-1.5 text-sm",
            isInCart
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10"
              : "shadow-md shadow-[rgba(224,74,18,0.3)]",
          )}
          style={
            !isInCart
              ? { background: "linear-gradient(135deg,#FF5A1F,#E04A12)" }
              : undefined
          }
        >
          {isInCart ? (
            <>
              <Check className="size-4" />
              In cart
            </>
          ) : (
            <>
              <ShoppingBag className="size-4" />
              Add to cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Post-purchase footer — chapters + progress bar + continue CTA
// ============================================================================
function PurchasedFooter({
  course,
  progress,
  chaptersTotal,
}: {
  course: CourseListItem;
  progress: CourseProgress;
  chaptersTotal: number;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(progress.percentComplete)));
  const isDone = pct === 100;

  return (
    <div className="mt-auto space-y-4 border-t border-[rgba(255,90,31,0.08)] pt-4">
      {/* Chapters + progress label */}
      <div className="flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1.5 text-white/65">
          <BookOpen className="size-4" />
          {chaptersTotal} chapter{chaptersTotal === 1 ? "" : "s"}
        </span>
        <span
          className={cn(
            "font-semibold tabular-nums",
            isDone ? "text-emerald-300" : "text-[#FFB07A]",
          )}
        >
          {pct}% complete
        </span>
      </div>

      {/* Progress bar — animates on mount */}
      <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            isDone
              ? "bg-linear-to-r from-emerald-500 to-emerald-400"
              : "bg-linear-to-r from-[#FF5A1F] to-[#FFB07A]",
          )}
        />
      </div>

      {/* Continue CTA */}
      <Button
        asChild
        size="sm"
        variant="outline"
        className="h-9 w-full gap-1.5 border-[rgba(255,90,31,0.3)] bg-[rgba(255,90,31,0.05)] text-sm text-[#FFB07A] hover:bg-[rgba(255,90,31,0.1)] hover:text-white"
      >
        <Link
          href={progress.resumeHref ?? `/learn/${course.slug}`}
          className="inline-flex items-center"
        >
          {isDone ? (
            <>
              Review course
              <ArrowRight className="size-4" />
            </>
          ) : (
            <>
              <PlayCircle className="size-4" />
              {pct === 0 ? "Start learning" : "Continue"}
            </>
          )}
        </Link>
      </Button>
    </div>
  );
}
