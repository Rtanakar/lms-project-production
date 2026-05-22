// ============================================================================
// course-validator.ts — Zod schemas for create + edit forms
// ============================================================================
// Mirrors backend `api/src/modules/courses/course.validator.ts`. Frontend
// validates BEFORE submit so server only sees clean payloads — saves a round
// trip on bad input and gives instant field-level errors via RHF.
//
// Keep enums + max lengths in sync with backend. Server schema is the final
// source of truth (defense in depth) — these are UX optimization only.
// ============================================================================

import { z } from "zod";

// ============================================================================
// Shared enums + labels (UI dropdowns)
// ============================================================================
export const courseStatuses = [
  "DRAFT",
  "COMING_SOON",
  "UPCOMING",
  "LIVE",
  "COMPLETED",
  "ARCHIVED",
] as const;

export const courseStatusLabels: Record<
  (typeof courseStatuses)[number],
  string
> = {
  DRAFT: "Draft",
  COMING_SOON: "Coming Soon",
  UPCOMING: "Upcoming",
  LIVE: "Live",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

export const courseLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export const courseLevelLabels: Record<(typeof courseLevels)[number], string> =
  {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
  };

export const courseStatusEnum = z.enum(courseStatuses);
export const courseLevelEnum = z.enum(courseLevels);

// ============================================================================
// CREATE schema — required fields enforced
// ============================================================================
export const createCourseSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(140),
    slug: z
      .string()
      .min(3)
      .max(140)
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only")
      .optional()
      .or(z.literal("")),
    subtitle: z.string().max(280).optional().or(z.literal("")),

    descriptionText: z.string().max(5000).optional().or(z.literal("")),
    // TipTap HTML — stored as-is. Length cap = abuse guard.
    description: z.string().max(200_000).optional().or(z.literal("")),

    // R2 keys + public URLs — uploaded via presigned flow, stored as URLs.
    coverImageUrl: z.string().url().optional().or(z.literal("")),
    thumbnailUrl: z.string().url().optional().or(z.literal("")),
    demoVideoUrl: z.string().url().optional().or(z.literal("")),
    ogImageUrl: z.string().url().optional().or(z.literal("")),

    status: courseStatusEnum.default("DRAFT"),
    level: courseLevelEnum.default("BEGINNER"),

    price: z.number().int().min(0).default(0),
    originalPrice: z.number().int().min(0).default(0),
    currency: z.string().length(3).default("INR"),

    // Dates — `coerce` accepts string/Date from form input
    startDate: z.coerce.date().nullable().optional(),
    endDate: z.coerce.date().nullable().optional(),
    enrollmentEndsAt: z.coerce.date().nullable().optional(),
    durationHours: z.number().int().min(0).default(0),
    durationWeeks: z.number().int().min(0).nullable().optional(),

    // Array fields — comma-separated input parsed to array in form
    tags: z.array(z.string().min(1).max(40)).max(20).default([]),
    whatYouLearn: z.array(z.string().min(1).max(200)).max(30).default([]),
    prerequisites: z.array(z.string().min(1).max(200)).max(30).default([]),
    includes: z.array(z.string().min(1).max(200)).max(30).default([]),

    metaTitle: z.string().max(70).optional().or(z.literal("")),
    metaDescription: z.string().max(160).optional().or(z.literal("")),
  })
  .refine((d) => d.originalPrice === 0 || d.originalPrice >= d.price, {
    message: "Original price must be ≥ price",
    path: ["originalPrice"],
  });

// ─── Input vs Output types (CRITICAL for RHF + Zod with .default()) ────────
// `.default()` makes a field OPTIONAL in input but REQUIRED in output:
//   • CreateCourseFormInput = what RHF holds (defaults optional)
//   • CreateCourseInput     = what resolver returns / API receives (all filled)
//
// `useForm<Input, Context, Output>` 3-generic signature wires them correctly.
// ───────────────────────────────────────────────────────────────────────────
export type CreateCourseFormInput = z.input<typeof createCourseSchema>;
export type CreateCourseInput = z.output<typeof createCourseSchema>;

// ============================================================================
// UPDATE schema — all optional (PATCH semantics)
// ============================================================================
export const updateCourseSchema = z
  .object({
    title: z.string().min(3).max(140).optional(),
    slug: z
      .string()
      .min(3)
      .max(140)
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only")
      .optional(),
    subtitle: z.string().max(280).nullable().optional(),
    descriptionText: z.string().max(5000).nullable().optional(),
    description: z.string().max(200_000).nullable().optional(),

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
      message: "Original price must be ≥ price",
      path: ["originalPrice"],
    },
  );

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// ============================================================================
// Form values type — what RHF actually holds (no nulls for inputs; "" instead)
// ============================================================================
// RHF + native inputs can't represent `null` cleanly. We hold `""` in form
// and convert to `null`/`undefined` at submit time when building API payload.
// ============================================================================
export type CourseFormValues = z.input<typeof createCourseSchema>;

// ============================================================================
// slugify — title → slug helper (matches backend `utils/slugify.ts` behavior)
// ============================================================================
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanum
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
