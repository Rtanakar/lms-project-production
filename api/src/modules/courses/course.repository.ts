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
//
// Why function-object pattern (not class)?
//   - Idiomatic TS (no `this` confusion)
//   - Tree-shakeable
//   - Same DX as class but lighter
// ============================================================================

import { prisma } from "../../db/db.js";
import type { Prisma } from "../../generated/prisma/client.js";

// ============================================================================
// Reusable include shapes — keeps service code lean
// ============================================================================
const summaryInclude = {
  instructor: {
    select: { id: true, name: true, image: true },
  },
} satisfies Prisma.CourseInclude;

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
// Course repository
// ============================================================================
export const courseRepository = {
  // ─── Course ──────────────────────────────────────────────────────────────

  /** List courses with filters, sort, pagination. Returns rows + count parallel. */
  async list(args: {
    where: Prisma.CourseWhereInput;
    orderBy: Prisma.CourseOrderByWithRelationInput;
    skip: number;
    take: number;
  }) {
    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where: args.where,
        orderBy: args.orderBy,
        skip: args.skip,
        take: args.take,
        include: summaryInclude,
      }),
      prisma.course.count({ where: args.where }),
    ]);
    return { items, total };
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
      include: summaryInclude,
    });
  },

  update(id: string, data: Prisma.CourseUpdateInput) {
    return prisma.course.update({
      where: { id },
      data,
      include: summaryInclude,
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
