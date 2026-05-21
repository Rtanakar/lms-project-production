// ============================================================================
// course.validator.ts — Zod schemas for Course / Module / FAQ endpoints
// ============================================================================

import { z } from "zod";

// ============================================================================
// Shared enums (mirror Prisma)
// ============================================================================
export const courseStatusEnum = z.enum([
  "DRAFT",
  "COMING_SOON",
  "UPCOMING",
  "LIVE",
  "COMPLETED",
  "ARCHIVED",
]);

export const courseLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

// ============================================================================
// CREATE Course
// ============================================================================
export const createCourseSchema = z
  .object({
    title: z.string().min(3).max(140),
    slug: z.string().min(3).max(140).optional(),
    subtitle: z.string().max(280).optional(),

    descriptionText: z.string().max(5000).optional(),
    description: z.record(z.string(), z.any()).optional(),

    coverImageUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    demoVideoUrl: z.string().url().optional(),
    ogImageUrl: z.string().url().optional(),

    status: courseStatusEnum.default("DRAFT"),
    level: courseLevelEnum.default("BEGINNER"),

    price: z.number().int().min(0).default(0),
    originalPrice: z.number().int().min(0).default(0),
    currency: z.string().length(3).default("INR"),

    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    enrollmentEndsAt: z.coerce.date().optional(),
    durationHours: z.number().int().min(0).default(0),
    durationWeeks: z.number().int().min(0).optional(),

    tags: z.array(z.string().min(1).max(40)).max(20).default([]),
    whatYouLearn: z.array(z.string().min(1).max(200)).max(30).default([]),
    prerequisites: z.array(z.string().min(1).max(200)).max(30).default([]),
    includes: z.array(z.string().min(1).max(200)).max(30).default([]),

    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),

    instructorId: z.string().min(1).optional(),
  })
  .refine((d) => d.originalPrice === 0 || d.originalPrice >= d.price, {
    message: "originalPrice must be >= price",
    path: ["originalPrice"],
  });

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

// ============================================================================
// UPDATE Course — PATCH (all optional)
// ============================================================================
export const updateCourseSchema = z
  .object({
    title: z.string().min(3).max(140).optional(),
    slug: z.string().min(3).max(140).optional(),
    subtitle: z.string().max(280).nullable().optional(),
    descriptionText: z.string().max(5000).nullable().optional(),
    description: z.record(z.string(), z.any()).nullable().optional(),

    coverImageUrl: z.string().url().nullable().optional(),
    thumbnailUrl: z.string().url().nullable().optional(),
    demoVideoUrl: z.string().url().nullable().optional(),
    ogImageUrl: z.string().url().nullable().optional(),

    status: courseStatusEnum.optional(),
    level: courseLevelEnum.optional(),

    price: z.number().int().min(0).optional(),
    originalPrice: z.number().int().min(0).optional(),
    currency: z.string().length(3).optional(),

    startDate: z.coerce.date().nullable().optional(),
    endDate: z.coerce.date().nullable().optional(),
    enrollmentEndsAt: z.coerce.date().nullable().optional(),
    durationHours: z.number().int().min(0).optional(),
    durationWeeks: z.number().int().min(0).nullable().optional(),

    tags: z.array(z.string().min(1).max(40)).max(20).optional(),
    whatYouLearn: z.array(z.string().min(1).max(200)).max(30).optional(),
    prerequisites: z.array(z.string().min(1).max(200)).max(30).optional(),
    includes: z.array(z.string().min(1).max(200)).max(30).optional(),

    metaTitle: z.string().max(70).nullable().optional(),
    metaDescription: z.string().max(160).nullable().optional(),
  })
  .refine(
    (d) =>
      d.price === undefined ||
      d.originalPrice === undefined ||
      d.originalPrice === 0 ||
      d.originalPrice >= d.price,
    {
      message: "originalPrice must be >= price",
      path: ["originalPrice"],
    },
  );

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// ============================================================================
// LIST query — cursor + offset hybrid pagination
// ============================================================================
// New clients: send `cursor + limit` for stable next-page (no drift on inserts)
// Old clients: send `page + limit` — offset fallback works as before.
// ============================================================================
export const listCoursesQuerySchema = z.object({
  status: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").map((s) => s.trim()) : undefined))
    .pipe(z.array(courseStatusEnum).optional()),

  level: courseLevelEnum.optional(),
  tag: z.string().max(40).optional(),
  q: z.string().max(80).optional(),

  // ── Cursor pagination (preferred for next-page) ──
  cursor: z.string().min(1).max(40).optional(),

  // ── Offset pagination (back-compat + "jump to page N" UX) ──
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),

  sort: z
    .enum(["newest", "oldest", "price-asc", "price-desc", "popular", "rating"])
    .default("newest"),
});

export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;

// ============================================================================
// Archive — optional reason for audit trail
// ============================================================================
export const archiveCourseSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export type ArchiveCourseInput = z.infer<typeof archiveCourseSchema>;

// ============================================================================
// Module
// ============================================================================
export const createModuleSchema = z.object({
  title: z.string().min(1).max(140),
  label: z.string().max(40).optional(),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0),
  unlockedAt: z.coerce.date().optional(),
  isFree: z.boolean().default(false),
});

export const updateModuleSchema = createModuleSchema.partial();

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;

// ============================================================================
// FAQ
// ============================================================================
export const createFAQSchema = z.object({
  question: z.string().min(3).max(280),
  answer: z.string().min(3).max(4000),
  order: z.number().int().min(0).default(0),
});

export const updateFAQSchema = createFAQSchema.partial();

export type CreateFAQInput = z.infer<typeof createFAQSchema>;
export type UpdateFAQInput = z.infer<typeof updateFAQSchema>;

// ============================================================================
// Param schemas
// ============================================================================
export const slugParamSchema = z.object({
  slug: z.string().min(1).max(140),
});

export const idParamSchema = z.object({
  id: z.string().min(1).max(40),
});

export const courseAndChildParamSchema = z.object({
  id: z.string().min(1).max(40),
  childId: z.string().min(1).max(40),
});
