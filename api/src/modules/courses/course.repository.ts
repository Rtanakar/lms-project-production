// ============================================================================
// course.repository.ts — Data access layer for Course aggregate
// ============================================================================
// Repository pattern (NestJS / DDD-inspired):
//   - SERVICE never touches Prisma directly
//   - REPOSITORY = ONLY layer that calls prisma.course.*, prisma.courseModule.*, etc.
//   - Service consumes repository methods → testable (mock repo, not prisma)
//
// Aggregate root pattern: Course is the root, Module + FAQ are children.
// ONE repository handles all three (instead of 3 separate repos) — keeps
// related operations cohesive.
// ============================================================================

import { prisma } from "../../db/db.js";
import { Prisma } from "../../generated/prisma/client.js";

// ============================================================================
// COURSE_LIST_SELECT — explicit select for list rows (Netflix/Uber pattern)
// ============================================================================
// `satisfies Prisma.CourseSelect` → compile-time check, no `include` leakage.
// Derived row type via `GetPayload<{ select: typeof ... }>` — single source of
// truth, refactors propagate automatically.
// ============================================================================
const COURSE_LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  descriptionText: true,
  coverImageUrl: true,
  thumbnailUrl: true,
  demoVideoUrl: true,
  ogImageUrl: true,
  status: true,
  level: true,
  tags: true,
  price: true,
  originalPrice: true,
  discountPercent: true,
  currency: true,
  startDate: true,
  endDate: true,
  enrollmentEndsAt: true,
  durationHours: true,
  durationWeeks: true,
  whatYouLearn: true,
  prerequisites: true,
  includes: true,
  studentsEnrolled: true,
  rating: true,
  ratingCount: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  instructorId: true,
  instructor: {
    select: { id: true, name: true, image: true },
  },
} as const satisfies Prisma.CourseSelect;

export type CourseListRow = Prisma.CourseGetPayload<{
  select: typeof COURSE_LIST_SELECT;
}>;

// Detail include — full relations for /:slug
const detailInclude = {
  instructor: {
    select: { id: true, name: true, image: true, email: true },
  },
  modules: {
    orderBy: { order: "asc" as const },
  },
  faqs: {
    orderBy: { order: "asc" as const },
  },
} satisfies Prisma.CourseInclude;

// ============================================================================
// Cursor + offset hybrid page fetcher
// ============================================================================
// `take + 1` trick:
//   - Fetch one extra row to detect hasNextPage without extra query
//   - If extra row present → drop it from items, use last visible id as nextCursor
//   - If cursor provided → skip 1 (Prisma cursor is inclusive)
//   - If no cursor + page > 1 → offset fallback for "jump to page N" UX
//
// `id` as secondary sort: createdAt collisions (bulk imports) get stable order,
// which cursor pagination requires for correctness.
// ============================================================================
async function findPage(args: {
  where: Prisma.CourseWhereInput;
  orderBy: Prisma.CourseOrderByWithRelationInput;
  cursor?: string | null;
  limit: number;
  page: number;
}) {
  const { where, orderBy, cursor, limit, page } = args;

  // Inject `id` as final tiebreaker so cursor pagination is deterministic.
  const stableOrderBy: Prisma.CourseOrderByWithRelationInput[] = [
    orderBy,
    { id: "desc" },
  ];

  const rows = await prisma.course.findMany({
    where,
    orderBy: stableOrderBy,
    take: limit + 1,
    ...(cursor
      ? { cursor: { id: cursor }, skip: 1 }
      : page > 1
        ? { skip: (page - 1) * limit }
        : {}),
    select: COURSE_LIST_SELECT,
  });

  const hasNextPage = rows.length > limit;
  const items = (hasNextPage ? rows.slice(0, limit) : rows) as CourseListRow[];
  const nextCursor = hasNextPage ? (items.at(-1)?.id ?? null) : null;

  return { items, nextCursor, hasNextPage };
}

// ============================================================================
// Course repository
// ============================================================================
export const courseRepository = {
  // ─── Course ──────────────────────────────────────────────────────────────

  /** Cursor+offset hybrid page fetch — parallel with count for totalPages. */
  async list(args: {
    where: Prisma.CourseWhereInput;
    orderBy: Prisma.CourseOrderByWithRelationInput;
    cursor?: string | null;
    limit: number;
    page: number;
  }) {
    const [pageData, totalCount] = await Promise.all([
      findPage(args),
      prisma.course.count({ where: args.where }),
    ]);
    return { ...pageData, totalCount };
  },

  /** Fetch by primary key (no relations) */
  findById(id: string) {
    return prisma.course.findUnique({ where: { id } });
  },

  /** Fetch by slug with full detail (instructor + modules + FAQs) */
  findBySlug(slug: string) {
    return prisma.course.findUnique({
      where: { slug },
      include: detailInclude,
    });
  },

  /** Fetch by slug — light (uniqueness check only) */
  findBySlugLight(slug: string) {
    return prisma.course.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });
  },

  create(data: Prisma.CourseCreateInput) {
    return prisma.course.create({
      data,
      select: COURSE_LIST_SELECT,
    });
  },

  update(id: string, data: Prisma.CourseUpdateInput) {
    return prisma.course.update({
      where: { id },
      data,
      select: COURSE_LIST_SELECT,
    });
  },

  delete(id: string) {
    return prisma.course.delete({ where: { id } });
  },

  // ─── Modules (children of Course) ────────────────────────────────────────

  findModuleById(id: string) {
    return prisma.courseModule.findUnique({ where: { id } });
  },

  createModule(data: Prisma.CourseModuleUncheckedCreateInput) {
    return prisma.courseModule.create({ data });
  },

  updateModule(id: string, data: Prisma.CourseModuleUpdateInput) {
    return prisma.courseModule.update({ where: { id }, data });
  },

  deleteModule(id: string) {
    return prisma.courseModule.delete({ where: { id } });
  },

  // ─── FAQs (children of Course) ───────────────────────────────────────────

  findFAQById(id: string) {
    return prisma.courseFAQ.findUnique({ where: { id } });
  },

  createFAQ(data: Prisma.CourseFAQUncheckedCreateInput) {
    return prisma.courseFAQ.create({ data });
  },

  updateFAQ(id: string, data: Prisma.CourseFAQUpdateInput) {
    return prisma.courseFAQ.update({ where: { id }, data });
  },

  deleteFAQ(id: string) {
    return prisma.courseFAQ.delete({ where: { id } });
  },
} as const;

export type CourseRepository = typeof courseRepository;
