// ============================================================================
// types.ts — Course domain types
// ============================================================================
// Single source of truth for Course-related TypeScript types.
// Mirrors Prisma schema — keep in sync if schema changes.
// ============================================================================

export type CourseStatus =
  | "DRAFT"
  | "COMING_SOON"
  | "UPCOMING"
  | "LIVE"
  | "COMPLETED"
  | "ARCHIVED";

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type CourseSort =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "popular"
  | "rating";

// ─── Instructor (light shape — list response) ───
export interface CourseInstructorSummary {
  id: string;
  name: string;
  image: string | null;
}

// ─── List row — from GET /api/v1/courses ───
export interface CourseListItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  descriptionText: string | null;
  coverImageUrl: string | null;
  thumbnailUrl: string | null;
  demoVideoUrl: string | null;
  ogImageUrl: string | null;
  status: CourseStatus;
  level: CourseLevel;
  tags: string[];
  price: number;
  originalPrice: number;
  discountPercent: number;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  enrollmentEndsAt: string | null;
  durationHours: number;
  durationWeeks: number | null;
  whatYouLearn: string[];
  prerequisites: string[];
  includes: string[];
  studentsEnrolled: number;
  rating: number;
  ratingCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  instructor: CourseInstructorSummary;
}

// ─── Pagination meta (offset-based, matches backend `pagination` field) ───
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── List response — cursor + offset hybrid (backend §6 pattern) ───
// `nextCursor` for cursor-mode next-page (stable, no drift on inserts)
// `pagination` retained for legacy offset consumers + "jump to page" UX
export interface CourseListResponse {
  items: CourseListItem[];
  nextCursor?: string | null;
  totalCount?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  pagination: PaginationMeta;
}

// ─── Query input for list endpoint ───
export interface ListCoursesQuery {
  status?: string; // CSV: "LIVE,UPCOMING"
  level?: CourseLevel;
  tag?: string;
  q?: string;
  cursor?: string; // ⭐ cursor pagination (preferred for next-page)
  page?: number;
  limit?: number;
  sort?: CourseSort;
}

// ─── Status meta — for UI badges + filter labels ───
export const COURSE_STATUS_META: Record<
  CourseStatus,
  { label: string; tone: string }
> = {
  DRAFT: {
    label: "Draft",
    tone: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  },
  COMING_SOON: {
    label: "Coming Soon",
    tone: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  UPCOMING: {
    label: "Upcoming",
    tone: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  LIVE: {
    label: "Live",
    tone: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  COMPLETED: {
    label: "Completed",
    tone: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  },
  ARCHIVED: {
    label: "Archived",
    tone: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
};

export const COURSE_LEVEL_META: Record<CourseLevel, { label: string }> = {
  BEGINNER: { label: "Beginner" },
  INTERMEDIATE: { label: "Intermediate" },
  ADVANCED: { label: "Advanced" },
};
