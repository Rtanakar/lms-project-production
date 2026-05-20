// ============================================================================
// upload.validator.ts — Zod schema for presigned URL request
// ============================================================================

import { z } from "zod";

// Mirror UploadKind type from r2.ts (Zod enum runtime-validates)
export const uploadKindEnum = z.enum([
  "course-cover",
  "course-thumb",
  "course-demo-video",
  "course-content-image",
  "user-avatar",
]);

export const presignUploadSchema = z.object({
  /** Asset category — determines folder + MIME allowlist + size limit */
  kind: uploadKindEnum,

  /** MIME type — strictly validated against kind allowlist server-side */
  contentType: z
    .string()
    .min(3)
    .max(127)
    .regex(/^[\w-]+\/[\w.+-]+$/, "Invalid MIME type"),

  /** Original filename — used for extension preservation */
  filename: z.string().min(1).max(255),

  /** File size in bytes — must match kind's max limit */
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(500 * 1024 * 1024, "File exceeds 500MB hard cap"),
});

export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
