// ============================================================================
// course.service.ts — Course business logic (uses repository, NOT Prisma)
// ============================================================================
// LAYER BOUNDARY:
//   Controller (HTTP)    →  Service (business)   →  Repository (DB)
//   thin                    fat                     thin
//
// Service responsibilities:
//   - Business rules (discount compute, slug uniqueness, ownership checks)
//   - Authorization (instructor-owner / admin gates)
//   - Status transitions (DRAFT → publishedAt set once, archive/restore)
//   - Orchestration across repos
//
// Service does NOT:
//   - Touch prisma directly (repository's job)
//   - Read req/res (controller's job)
//   - Validate input (validator's job — Zod did it before reaching here)
// ============================================================================

import { Prisma } from "../../generated/prisma/client.js";
import { slugify, uniqueSlugify } from "../../utils/slugify.js";
import { NotFound, Forbidden, BadRequest } from "../../utils/app-error.js";
import { courseRepository } from "./course.repository.js";
import type {
  CreateCourseInput,
  UpdateCourseInput,
  ListCoursesQuery,
  CreateModuleInput,
  UpdateModuleInput,
  CreateFAQInput,
  UpdateFAQInput,
  ArchiveCourseInput,
} from "./course.validator.js";

// ============================================================================
// Helpers
// ============================================================================

/** Auto-compute discount from price/originalPrice for cached column. */
function computeDiscount(price: number, originalPrice: number): number {
  if (originalPrice <= 0 || price >= originalPrice) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * Build full-text search WHERE clause.
 * Empty/whitespace search → empty object (no-op in spread).
 * Searches: title, subtitle, descriptionText, slug + tag containment.
 */
function buildCourseSearchWhere(q?: string): Prisma.CourseWhereInput {
  if (!q?.trim()) return {};
  const term = q.trim();
  return {
    OR: [
      { title: { contains: term, mode: Prisma.QueryMode.insensitive } },
      { subtitle: { contains: term, mode: Prisma.QueryMode.insensitive } },
      {
        descriptionText: { contains: term, mode: Prisma.QueryMode.insensitive },
      },
      { slug: { contains: term, mode: Prisma.QueryMode.insensitive } },
      { tags: { has: term } },
    ],
  };
}

/** Resolve sort enum to Prisma orderBy. */
function buildOrderBy(
  sort: ListCoursesQuery["sort"],
): Prisma.CourseOrderByWithRelationInput {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" };
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "popular":
      return { studentsEnrolled: "desc" };
    case "rating":
      return { rating: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

/**
 * Ownership guard reused by all write ops.
 * - ADMIN → can edit any course
 * - INSTRUCTOR → can edit only their own courses
 */
async function ensureCourseOwnership(
  courseId: string,
  user: { id: string; role: string },
) {
  const course = await courseRepository.findById(courseId);
  if (!course) throw new NotFound("Course not found", "COURSE_NOT_FOUND");

  if (user.role !== "ADMIN" && course.instructorId !== user.id) {
    throw new Forbidden("You don't own this course", "NOT_OWNER");
  }
  return course;
}

// ============================================================================
// LIST courses — cursor + offset hybrid
// ============================================================================
export async function listCourses(query: ListCoursesQuery) {
  const { status, level, tag, q, cursor, page, limit, sort } = query;

  // Default visibility: hide DRAFT + ARCHIVED from public
  const statusFilter: Prisma.CourseWhereInput["status"] =
    status && status.length > 0
      ? { in: status as Prisma.EnumCourseStatusFilter["in"] }
      : { in: ["COMING_SOON", "UPCOMING", "LIVE", "COMPLETED"] };

  // Compose WHERE — spread pattern keeps undefined filters out of the query
  const where: Prisma.CourseWhereInput = {
    status: statusFilter,
    ...(level && { level }),
    ...(tag && { tags: { has: tag } }),
    ...buildCourseSearchWhere(q),
  };

  const { items, nextCursor, hasNextPage, totalCount } =
    await courseRepository.list({
      where,
      orderBy: buildOrderBy(sort),
      cursor,
      limit,
      page,
    });

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return {
    items,
    // New shape — cursor + offset hybrid (PROJECT_CONTEXT §6 pattern)
    nextCursor,
    totalCount,
    totalPages,
    hasNextPage,
    // cursor mode → previous exists if cursor sent; offset mode → page > 1
    hasPreviousPage: Boolean(cursor) || page > 1,
    // Legacy `pagination` object — kept for back-compat with existing frontend
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNext: hasNextPage,
      hasPrev: Boolean(cursor) || page > 1,
    },
  };
}

// ============================================================================
// GET by slug — full detail
// ============================================================================
export async function getCourseBySlug(slug: string) {
  const course = await courseRepository.findBySlug(slug);
  if (!course) throw new NotFound("Course not found", "COURSE_NOT_FOUND");
  return course;
}

// ============================================================================
// CREATE course
// ============================================================================
export async function createCourse(input: CreateCourseInput, authorId: string) {
  // Resolve unique slug
  let slug: string;
  if (input.slug) {
    slug = slugify(input.slug);
    const taken = await courseRepository.findBySlugLight(slug);
    if (taken) throw new BadRequest("Slug already taken", "SLUG_TAKEN");
  } else {
    slug = await uniqueSlugify(input.title, async (s) => {
      const existing = await courseRepository.findBySlugLight(s);
      return !!existing;
    });
  }

  const discountPercent = computeDiscount(input.price, input.originalPrice);

  const data: Prisma.CourseCreateInput = {
    slug,
    title: input.title,
    subtitle: input.subtitle,
    descriptionText: input.descriptionText,
    description: input.description ?? undefined,
    coverImageUrl: input.coverImageUrl,
    thumbnailUrl: input.thumbnailUrl,
    demoVideoUrl: input.demoVideoUrl,
    ogImageUrl: input.ogImageUrl,
    status: input.status,
    level: input.level,
    tags: input.tags,
    price: input.price,
    originalPrice: input.originalPrice,
    discountPercent,
    currency: input.currency,
    startDate: input.startDate,
    endDate: input.endDate,
    enrollmentEndsAt: input.enrollmentEndsAt,
    durationHours: input.durationHours,
    durationWeeks: input.durationWeeks,
    whatYouLearn: input.whatYouLearn,
    prerequisites: input.prerequisites,
    includes: input.includes,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    publishedAt: input.status !== "DRAFT" ? new Date() : null,
    instructor: { connect: { id: input.instructorId ?? authorId } },
  };

  return courseRepository.create(data);
}

// ============================================================================
// UPDATE course — PATCH
// ============================================================================
export async function updateCourse(
  id: string,
  input: UpdateCourseInput,
  user: { id: string; role: string },
) {
  const existing = await ensureCourseOwnership(id, user);

  // Slug uniqueness if changing
  let newSlug = existing.slug;
  if (input.slug && input.slug !== existing.slug) {
    newSlug = slugify(input.slug);
    const taken = await courseRepository.findBySlugLight(newSlug);
    if (taken && taken.id !== id) {
      throw new BadRequest("Slug already taken", "SLUG_TAKEN");
    }
  }

  // Re-compute discount on pricing change
  const newPrice = input.price ?? existing.price;
  const newOriginal = input.originalPrice ?? existing.originalPrice;
  const discountPercent = computeDiscount(newPrice, newOriginal);

  // publishedAt: set once when leaving DRAFT, never reset
  const transitioningToPublic =
    !existing.publishedAt && input.status && input.status !== "DRAFT";

  const data: Prisma.CourseUpdateInput = {
    ...(input.title !== undefined && { title: input.title }),
    slug: newSlug,
    ...(input.subtitle !== undefined && { subtitle: input.subtitle }),
    ...(input.descriptionText !== undefined && {
      descriptionText: input.descriptionText,
    }),
    ...(input.description !== undefined && {
      description: input.description ?? undefined,
    }),
    ...(input.coverImageUrl !== undefined && {
      coverImageUrl: input.coverImageUrl,
    }),
    ...(input.thumbnailUrl !== undefined && {
      thumbnailUrl: input.thumbnailUrl,
    }),
    ...(input.demoVideoUrl !== undefined && {
      demoVideoUrl: input.demoVideoUrl,
    }),
    ...(input.ogImageUrl !== undefined && { ogImageUrl: input.ogImageUrl }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.level !== undefined && { level: input.level }),
    ...(input.price !== undefined && { price: input.price }),
    ...(input.originalPrice !== undefined && {
      originalPrice: input.originalPrice,
    }),
    discountPercent,
    ...(input.currency !== undefined && { currency: input.currency }),
    ...(input.startDate !== undefined && { startDate: input.startDate }),
    ...(input.endDate !== undefined && { endDate: input.endDate }),
    ...(input.enrollmentEndsAt !== undefined && {
      enrollmentEndsAt: input.enrollmentEndsAt,
    }),
    ...(input.durationHours !== undefined && {
      durationHours: input.durationHours,
    }),
    ...(input.durationWeeks !== undefined && {
      durationWeeks: input.durationWeeks,
    }),
    ...(input.tags !== undefined && { tags: input.tags }),
    ...(input.whatYouLearn !== undefined && {
      whatYouLearn: input.whatYouLearn,
    }),
    ...(input.prerequisites !== undefined && {
      prerequisites: input.prerequisites,
    }),
    ...(input.includes !== undefined && { includes: input.includes }),
    ...(input.metaTitle !== undefined && { metaTitle: input.metaTitle }),
    ...(input.metaDescription !== undefined && {
      metaDescription: input.metaDescription,
    }),
    ...(transitioningToPublic && { publishedAt: new Date() }),
  };

  return courseRepository.update(id, data);
}

// ============================================================================
// ARCHIVE course — soft delete via status flip (INSTRUCTOR owner / ADMIN)
// ============================================================================
// Why archive instead of hard delete?
//   - Preserves enrollments, ratings, analytics history
//   - Reversible (restore endpoint flips back to DRAFT)
//   - Hidden from public list (statusFilter excludes ARCHIVED by default)
//
// `reason` is optional — surfaced to audit log later (not stored on Course
// model yet; would need an AuditLog table).
// ============================================================================
export async function archiveCourse(
  id: string,
  user: { id: string; role: string },
  _input: ArchiveCourseInput = {},
) {
  const existing = await ensureCourseOwnership(id, user);

  // No-op short circuit
  if (existing.status === "ARCHIVED") {
    throw new BadRequest("Course is already archived", "ALREADY_ARCHIVED");
  }

  return courseRepository.update(id, { status: "ARCHIVED" });
}

// ============================================================================
// RESTORE archived course → DRAFT (INSTRUCTOR owner / ADMIN)
// ============================================================================
// Restored course goes back to DRAFT (not previous status) — owner must
// re-publish explicitly to avoid surprise visibility flips.
// ============================================================================
export async function restoreCourse(
  id: string,
  user: { id: string; role: string },
) {
  const existing = await ensureCourseOwnership(id, user);

  if (existing.status !== "ARCHIVED") {
    throw new BadRequest("Course is not archived", "NOT_ARCHIVED");
  }

  return courseRepository.update(id, { status: "DRAFT" });
}

// ============================================================================
// DELETE course — ADMIN only (hard delete, cascades to modules + FAQs)
// ============================================================================
// Use archive for reversible "remove from listing". Hard delete should be
// rare — accidental deletes are unrecoverable.
// ============================================================================
export async function deleteCourse(id: string, user: { role: string }) {
  if (user.role !== "ADMIN") {
    throw new Forbidden("Only admins can delete courses", "ADMIN_ONLY");
  }
  const existing = await courseRepository.findById(id);
  if (!existing) throw new NotFound("Course not found", "COURSE_NOT_FOUND");

  await courseRepository.delete(id);
}

// ============================================================================
// MODULE CRUD (children of Course aggregate)
// ============================================================================
export async function createModule(
  courseId: string,
  input: CreateModuleInput,
  user: { id: string; role: string },
) {
  await ensureCourseOwnership(courseId, user);
  return courseRepository.createModule({ ...input, courseId });
}

export async function updateModule(
  courseId: string,
  moduleId: string,
  input: UpdateModuleInput,
  user: { id: string; role: string },
) {
  await ensureCourseOwnership(courseId, user);
  const existing = await courseRepository.findModuleById(moduleId);
  if (!existing || existing.courseId !== courseId) {
    throw new NotFound("Module not found", "MODULE_NOT_FOUND");
  }
  return courseRepository.updateModule(moduleId, input);
}

export async function deleteModule(
  courseId: string,
  moduleId: string,
  user: { id: string; role: string },
) {
  await ensureCourseOwnership(courseId, user);
  const existing = await courseRepository.findModuleById(moduleId);
  if (!existing || existing.courseId !== courseId) {
    throw new NotFound("Module not found", "MODULE_NOT_FOUND");
  }
  await courseRepository.deleteModule(moduleId);
}

// ============================================================================
// FAQ CRUD
// ============================================================================
export async function createFAQ(
  courseId: string,
  input: CreateFAQInput,
  user: { id: string; role: string },
) {
  await ensureCourseOwnership(courseId, user);
  return courseRepository.createFAQ({ ...input, courseId });
}

export async function updateFAQ(
  courseId: string,
  faqId: string,
  input: UpdateFAQInput,
  user: { id: string; role: string },
) {
  await ensureCourseOwnership(courseId, user);
  const existing = await courseRepository.findFAQById(faqId);
  if (!existing || existing.courseId !== courseId) {
    throw new NotFound("FAQ not found", "FAQ_NOT_FOUND");
  }
  return courseRepository.updateFAQ(faqId, input);
}

export async function deleteFAQ(
  courseId: string,
  faqId: string,
  user: { id: string; role: string },
) {
  await ensureCourseOwnership(courseId, user);
  const existing = await courseRepository.findFAQById(faqId);
  if (!existing || existing.courseId !== courseId) {
    throw new NotFound("FAQ not found", "FAQ_NOT_FOUND");
  }
  await courseRepository.deleteFAQ(faqId);
}
