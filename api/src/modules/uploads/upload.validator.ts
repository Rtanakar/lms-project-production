// ============================================================================
// upload.validator.ts — Zod schema for R2 presigned URL request
// ============================================================================

import { z } from "zod";

export const uploadKindEnum = z.enum([
  "course-cover",
  "course-thumb",
  "course-demo-video",
  "course-content-image",
  "course-content-file", // PDFs / docs / archives embedded in description
  "user-avatar",
]);

export const presignUploadSchema = z.object({
  kind: uploadKindEnum,
  contentType: z
    .string()
    .min(3)
    .max(127)
    .regex(/^[\w-]+\/[\w.+-]+$/, "Invalid MIME type"),
  filename: z.string().min(1).max(255),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(500 * 1024 * 1024, "File exceeds 500MB hard cap"),
});

export type PresignUploadInput = z.infer<typeof presignUploadSchema>;

// ============================================================================
// DELETE — remove R2 object(s). Accept key, url, OR bulk keys[].
// ============================================================================
// Caller usually has either:
//   - `key`  → directly remembered from presign response
//   - `url`  → only the publicUrl was stored (legacy / TipTap embeds)
//   - `keys` → bulk cleanup (e.g., editor wipe, course hard delete)
// `.refine()` catches empty `{}` payloads (must provide at least one).
// ============================================================================
export const deleteUploadSchema = z
  .object({
    key: z.string().min(1).max(512).optional(),
    url: z.string().url().optional(),
    keys: z.array(z.string().min(1).max(512)).max(100).optional(),
  })
  .refine(
    (d) => !!d.key || !!d.url || (d.keys && d.keys.length > 0),
    { message: "Provide at least one of: key, url, or keys[]" },
  );

export type DeleteUploadInput = z.infer<typeof deleteUploadSchema>;
