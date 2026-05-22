// ============================================================================
// r2.ts — Cloudflare R2 (S3-compatible) client + presigned URL helpers
// ============================================================================
// R2 = Cloudflare's S3-equivalent. FREE egress (vs AWS S3 expensive bandwidth).
// AWS SDK v3 works as-is — just point endpoint to R2.
//
// Why presigned URLs?
//   - Browser ko direct R2 pe PUT karne deta hai, Node se proxy NAHI
//   - 1GB upload Node memory pe load nahi hoga
//   - 5-min expiry — security tight
//   - Industry pattern: Vercel, Stripe, Linear, GitHub — sab yahi karte
//
// Flow:
//   1. Frontend → POST /api/v1/uploads/r2/presigned { kind, contentType }
//   2. Backend → returns { uploadUrl, publicUrl, key }
//   3. Frontend → PUT file directly to uploadUrl (browser → R2)
//   4. Frontend → embeds publicUrl in TipTap / Course form
// ============================================================================

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";

// ─── R2 S3 client ─────────────────────────────────────────
// R2 endpoint format: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
// Region MUST be "auto" for R2 (S3 SDK requirement)
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

// ============================================================================
// File kind — folder organization + content-type validation
// ============================================================================
// Industry pattern: separate folders per asset type. Easy cleanup, easy ACL
// rules, easy CDN cache strategies later.
// ============================================================================
export type UploadKind =
  | "course-cover" // Course hero / card image
  | "course-thumb" // Smaller course card thumb
  | "course-demo-video" // Marketing demo video (R2 MP4)
  | "course-content-image" // TipTap embedded images (description)
  | "course-content-file" // TipTap embedded attachments (PDF / docs / zips)
  | "user-avatar"; // Profile pictures

// Allowed MIME types per kind — defense against arbitrary uploads.
// `course-content-file` allows the document formats students actually share:
// PDF, Office docs, plain text, markdown, archives, CSV/JSON. We intentionally
// exclude executables, scripts, and HTML to keep stored content safe.
const ALLOWED_TYPES: Record<UploadKind, RegExp> = {
  "course-cover": /^image\/(png|jpe?g|webp|avif)$/,
  "course-thumb": /^image\/(png|jpe?g|webp|avif)$/,
  "course-demo-video": /^video\/(mp4|webm|quicktime)$/,
  "course-content-image": /^image\/(png|jpe?g|webp|avif|gif)$/,
  "course-content-file":
    /^(application\/(pdf|zip|x-zip-compressed|json|msword|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|vnd\.ms-(excel|powerpoint))|text\/(plain|markdown|csv))$/,
  "user-avatar": /^image\/(png|jpe?g|webp|avif)$/,
};

// Max file sizes per kind (bytes) — defense in depth (R2 has its own limits too)
const MAX_SIZE: Record<UploadKind, number> = {
  "course-cover": 5 * 1024 * 1024, // 5 MB
  "course-thumb": 2 * 1024 * 1024, // 2 MB
  "course-demo-video": 200 * 1024 * 1024, // 200 MB
  "course-content-image": 5 * 1024 * 1024, // 5 MB
  "course-content-file": 50 * 1024 * 1024, // 50 MB — typical course handout cap
  "user-avatar": 2 * 1024 * 1024, // 2 MB
};

// ============================================================================
// generatePresignedUploadUrl — main API for upload flow
// ============================================================================
export interface PresignedUploadInput {
  kind: UploadKind;
  contentType: string;
  /** Original filename (for extension only) */
  filename: string;
  /** File size in bytes — client-asserted, validated again on R2 side */
  sizeBytes: number;
}

export interface PresignedUploadResult {
  /** PUT URL — frontend uploads directly here (expires in 5 min) */
  uploadUrl: string;
  /** Public URL to use in DB / TipTap after upload completes */
  publicUrl: string;
  /** Object key in R2 (for delete operations later) */
  key: string;
  /** Required headers frontend must send with PUT */
  headers: Record<string, string>;
}

export async function generatePresignedUploadUrl({
  kind,
  contentType,
  filename,
  sizeBytes,
}: PresignedUploadInput): Promise<PresignedUploadResult> {
  // Validate content-type matches kind
  const allowed = ALLOWED_TYPES[kind];
  if (!allowed.test(contentType)) {
    throw new Error(
      `Content type "${contentType}" not allowed for kind "${kind}"`,
    );
  }

  // Validate size
  const max = MAX_SIZE[kind];
  if (sizeBytes > max) {
    throw new Error(
      `File too large: ${sizeBytes} bytes (max ${max} for kind "${kind}")`,
    );
  }

  // Extract extension (lowercase, sanitized)
  const ext =
    filename
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") ?? "bin";

  // Key format: kind/year/month/UUID.ext
  // Date-based folders help with cleanup queries + CDN cache
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const key = `${kind}/${year}/${month}/${randomUUID()}.${ext}`;

  // Generate presigned PUT URL — 5 min expiry
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ContentLength: sizeBytes,
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 }); // 5 min

  // Public URL — served via R2 public bucket OR custom domain
  // env.R2_PUBLIC_URL = e.g. "https://pub-xxx.r2.dev" (R2 dev domain)
  const publicUrl = `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;

  return {
    uploadUrl,
    publicUrl,
    key,
    headers: {
      // Frontend MUST send this exact Content-Type or PUT signature fails
      "Content-Type": contentType,
    },
  };
}

// ============================================================================
// deleteR2Object — for cleanup (e.g., user replaces cover image)
// ============================================================================

export async function deleteR2Object(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }),
  );
}

// Extract key from public URL — useful for cleanup
//   publicUrl = "https://pub-xxx.r2.dev/course-cover/2026/05/uuid.png"
//   key = "course-cover/2026/05/uuid.png"
export function keyFromPublicUrl(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    return url.pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}
