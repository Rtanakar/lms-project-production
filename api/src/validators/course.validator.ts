// ============================================================================
// course.validator.ts — Zod schemas for Course / Module / FAQ endpoints
// ============================================================================
// Single source of truth — same schemas used in frontend (copied) for forms.
// All update schemas are PARTIAL — admin can update any subset of fields.
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

export const courseLevelEnum = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);

// ============================================================================
// CREATE Course
// ============================================================================
// Minimum required: title. Everything else optional with sensible defaults.
// Allows quick "draft" creation that you flesh out later.
// ============================================================================
export const createCourseSchema = z
  .object({
    title: z.string().min(3).max(140),
    /** Slug auto-generated from title if not provided */
    slug: z.string().min(3).max(140).optional(),
    subtitle: z.string().max(280).optional(),

    /** Plain-text desc for SEO / search */
    descriptionText: z.string().max(5000).optional(),
    /** TipTap JSON content (rich body) */
    description: z.record(z.string(), z.any()).optional(),

    // Media URLs (already uploaded to R2 — frontend passes publicUrl)
    coverImageUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    demoVideoUrl: z.string().url().optional(),
    ogImageUrl: z.string().url().optional(),

    status: courseStatusEnum.default("DRAFT"),
    level: courseLevelEnum.default("BEGINNER"),

    // Pricing — INR rupees as integer
    price: z.number().int().min(0).default(0),
    originalPrice: z.number().int().min(0).default(0),
    currency: z.string().length(3).default("INR"),

    // Schedule
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    enrollmentEndsAt: z.coerce.date().optional(),
    durationHours: z.number().int().min(0).default(0),
    durationWeeks: z.number().int().min(0).optional(),

    // Marketing
    tags: z.array(z.string().min(1).max(40)).max(20).default([]),
    whatYouLearn: z.array(z.string().min(1).max(200)).max(30).default([]),
    prerequisites: z.array(z.string().min(1).max(200)).max(30).default([]),
    includes: z.array(z.string().min(1).max(200)).max(30).default([]),

    // SEO
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),

    /** Instructor override (admin only — defaults to caller) */
    instructorId: z.string().min(1).optional(),
  })
  .refine(
    (d) =>
      d.originalPrice === 0 || d.originalPrice >= d.price,
    {
      message: "originalPrice must be >= price",
      path: ["originalPrice"],
    },
  );

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

// ============================================================================
// UPDATE Course — all fields optional (PATCH semantics)
// ============================================================================
// All fields are individually updateable — admin can change price, status,
// description, demo video later via separate API calls.
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
// LIST Courses — query params for filtering/sorting
// ============================================================================
export const listCoursesQuerySchema = z.object({
  /** Filter by status — comma-separated; default shows all public */
  status: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").map((s) => s.trim()) : undefined))
    .pipe(z.array(courseStatusEnum).optional()),

  level: courseLevelEnum.optional(),
  tag: z.string().max(40).optional(),
  /** Search query — title/subtitle text match */
  q: z.string().max(80).optional(),

  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),

  sort: z
    .enum(["newest", "oldest", "price-asc", "price-desc", "popular", "rating"])
    .default("newest"),
});

export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;

// ============================================================================
// Module — sections inside a course (Day 1, Day 2, etc.)
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
// FAQ — per-course questions
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

export const courseIdParamSchema = z.object({
  id: z.string().min(1).max(40),
});

export const courseAndChildParamSchema = z.object({
  id: z.string().min(1).max(40),
  childId: z.string().min(1).max(40),
});
