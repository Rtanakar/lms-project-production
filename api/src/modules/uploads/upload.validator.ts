// ============================================================================
// upload.validator.ts — Zod schema for R2 presigned URL request
// ============================================================================

import { z } from "zod";

export const uploadKindEnum = z.enum([
  "course-cover",
  "course-thumb",
  "course-demo-video",
  "course-content-image",
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
