// ============================================================================
// upload-media.ts — Direct-to-R2 upload via presigned URL
// ============================================================================
// Industry pattern (used by Vercel, Linear, Notion):
//   1. Client → POST /api/v1/uploads/presigned with { kind, contentType, ... }
//   2. Server validates MIME + size → returns { uploadUrl, publicUrl, key, headers }
//   3. Client → PUT file directly to R2 (uploadUrl) — server never sees the file
//   4. Client uses `publicUrl` in form / TipTap content
//   5. Server stores `publicUrl` (or `key`) in DB
//
// Why this pattern?
//   - Bypasses Next.js 4MB body limit
//   - Bypasses backend memory + bandwidth
//   - Direct R2 = fast, scalable, no proxying overhead
//
// `key` is also returned alongside `publicUrl` — store both, key is used for
// cleanup (deleteObject) when content is removed.
// ============================================================================

import { api } from "./api-client";

// ============================================================================
// Upload kinds — matches backend `presignUploadSchema`
// ============================================================================
export type UploadKind =
  | "course-cover"
  | "course-thumb"
  | "course-demo-video"
  | "course-content-image"
  | "course-content-file"
  | "user-avatar";

// ============================================================================
// Backend response shape (from /api/v1/uploads/presigned)
// ============================================================================
interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  headers: Record<string, string>;
}

// ============================================================================
// Result returned to caller — what they need in the form
// ============================================================================
export interface UploadResult {
  key: string;
  url: string;
  contentType: string;
  size: number;
  /** Inferred from MIME — frontend uses for preview vs file chip */
  type: "image" | "video" | "file";
}

// ============================================================================
// MIME size limits (mirror backend) — fail fast before round trip
// ============================================================================
const SIZE_LIMITS: Record<UploadKind, number> = {
  "course-cover": 5 * 1024 * 1024, // 5 MB
  "course-thumb": 2 * 1024 * 1024, // 2 MB
  "course-demo-video": 200 * 1024 * 1024, // 200 MB
  "course-content-image": 5 * 1024 * 1024, // 5 MB
  "course-content-file": 50 * 1024 * 1024, // 50 MB — PDFs / docs / archives
  "user-avatar": 2 * 1024 * 1024, // 2 MB
};

// MIME allowlist mirrored from backend (r2.ts) — keep in sync. Used by
// `validateFileForKind` so users get a fast inline reject before hitting
// the presign endpoint.
const ALLOWED_FILE_MIME =
  /^(application\/(pdf|zip|x-zip-compressed|json|msword|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|vnd\.ms-(excel|powerpoint))|text\/(plain|markdown|csv))$/;

// ============================================================================
// WebP conversion targets per image kind (Netflix/Vercel pattern)
// ============================================================================
// High quality (0.92) + sensible max dimensions = great visual + 40-60%
// smaller files. Browser Canvas API does the encoding — no backend trip,
// no extra deps. Direct-to-R2 upload preserved.
//
// Dimensions chosen for highest-DPR display use cases:
//   - cover    → hero image (16:9 standard, retina-ready up to 1080p)
//   - thumb    → card/grid thumb (square, 2x retina 400px display)
//   - content  → in-editor image (16:9, fits article width)
//   - avatar   → profile (square, 2x retina 256px display)
// ============================================================================
interface WebPTarget {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

const WEBP_TARGETS: Partial<Record<UploadKind, WebPTarget>> = {
  "course-cover": { maxWidth: 1920, maxHeight: 1080, quality: 0.92 },
  "course-thumb": { maxWidth: 800, maxHeight: 800, quality: 0.9 },
  "course-content-image": { maxWidth: 1920, maxHeight: 1080, quality: 0.92 },
  "user-avatar": { maxWidth: 512, maxHeight: 512, quality: 0.9 },
  // course-demo-video → no WebP (video stays as-is)
};

const IMAGE_KINDS = new Set<UploadKind>([
  "course-cover",
  "course-thumb",
  "course-content-image",
  "user-avatar",
]);

// ============================================================================
// loadImage — File → HTMLImageElement (cleans up object URL)
// ============================================================================
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read image — file may be corrupt"));
    };
    img.src = url;
  });
}

// ============================================================================
// fitWithin — preserve aspect ratio while shrinking to fit a box
// ============================================================================
function fitWithin(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) return { width, height };
  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

// ============================================================================
// convertImageToWebP — high-quality canvas encode
// ============================================================================
// Skips conversion if file is already WebP AND under size limit / target dims —
// avoids re-encoding (lossy step) when input is already optimized.
// ============================================================================
async function convertImageToWebP(
  file: File,
  target: WebPTarget,
): Promise<File> {
  // Skip if already WebP and reasonably small (under 1MB)
  if (file.type === "image/webp" && file.size < 1024 * 1024) return file;

  const img = await loadImage(file);
  const { width, height } = fitWithin(
    img.naturalWidth,
    img.naturalHeight,
    target.maxWidth,
    target.maxHeight,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Canvas 2D context not supported");

  // High-quality resampling (Lanczos-equivalent on modern browsers)
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", target.quality),
  );
  if (!blob) throw new Error("WebP encoding failed");

  // Rename file with .webp extension (preserves the base name)
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const newName = `${baseName || "image"}.webp`;

  return new File([blob], newName, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

function inferType(contentType: string): UploadResult["type"] {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  return "file";
}

// ============================================================================
// uploadMedia — single-call upload (presign → PUT → return urls)
// ============================================================================
// Throws on:
//   - File too large (client-side check)
//   - Presign API error (4xx/5xx — ApiClientError)
//   - R2 PUT failure (network / 4xx from R2)
//
// `onProgress` optional — for future drag-drop / progress bars. Not used in
// MVP; XMLHttpRequest would replace fetch when implemented.
// ============================================================================
export async function uploadMedia(
  input: File,
  kind: UploadKind,
): Promise<UploadResult> {
  let file = input;
  // ─── 1. Client-side size check (avoid round trip) ───
  const limit = SIZE_LIMITS[kind];
  if (file.size > limit) {
    const mb = (limit / 1024 / 1024).toFixed(0);
    throw new Error(`File exceeds ${mb}MB limit for ${kind}`);
  }

  // ─── 1a. Browser-side WebP conversion for image kinds ───
  // Netflix/Vercel pattern — encode to WebP on the client before upload.
  // 40-60% smaller at visually identical quality, zero backend cost.
  if (IMAGE_KINDS.has(kind) && file.type.startsWith("image/")) {
    const target = WEBP_TARGETS[kind];
    if (target) {
      try {
        file = await convertImageToWebP(file, target);
      } catch (err) {
        // Non-fatal — fall back to original file if encode fails
        console.warn("[uploadMedia] WebP conversion failed, using original:", err);
      }
    }
  }

  // ─── 2. Request presigned URL from backend ───
  const presign = await api<PresignResponse>("/api/v1/uploads/presigned", {
    method: "POST",
    json: {
      kind,
      contentType: file.type || "application/octet-stream",
      filename: file.name,
      sizeBytes: file.size,
    },
  });

  // ─── 3. PUT file directly to R2 ───
  // Common failure modes:
  //   - "Failed to fetch" → R2 bucket CORS policy doesn't allow PUT from
  //     this origin. Add http://localhost:3000 (or prod URL) to CORS in
  //     Cloudflare dashboard: R2 → bucket → Settings → CORS Policy.
  //   - 403 SignatureDoesNotMatch → Content-Type sent doesn't match the
  //     ContentType baked into the signed URL. Should never happen since
  //     we pass `presign.headers` verbatim.
  //   - 413 EntityTooLarge → File exceeds R2's per-object limit.
  let putRes: Response;
  try {
    putRes = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: presign.headers,
      body: file,
    });
  } catch (err) {
    // `Failed to fetch` is browser-opaque for CORS — surface a helpful hint
    throw new Error(
      "Upload to storage failed (network or CORS). Check that the R2 " +
        "bucket CORS policy allows PUT from this origin. " +
        `Original error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!putRes.ok) {
    // Try to read the XML error R2 returns on signature/size failures
    let detail = putRes.statusText;
    try {
      const body = await putRes.text();
      if (body) detail = `${detail} — ${body.slice(0, 200)}`;
    } catch {
      /* ignore */
    }
    throw new Error(`R2 upload failed (${putRes.status}): ${detail}`);
  }

  // ─── 4. Return key + public URL + metadata for form storage ───
  return {
    key: presign.key,
    url: presign.publicUrl,
    contentType: file.type || "application/octet-stream",
    size: file.size,
    type: inferType(file.type),
  };
}

// ============================================================================
// deleteMedia — single-call cleanup (R2 + idempotent)
// ============================================================================
// Accepts either an R2 key OR a public URL. Backend resolves URL → key, then
// deletes from R2. Idempotent — deleting a non-existent key returns success
// (R2 contract).
//
// Best-effort: errors are caught + logged via toast (optional). Caller may
// also pass `silent: true` to suppress UI noise (e.g., from TipTap node
// removal listener where users didn't explicitly trigger the delete).
// ============================================================================
interface DeleteMediaResponse {
  requested: number;
  deleted: number;
  failed: number;
  failures: Array<{ key: string; reason: string }>;
}

export async function deleteMedia(
  keyOrUrl: string,
): Promise<DeleteMediaResponse> {
  // Detect: starts with "http(s)://" → URL, else → key
  const isUrl = /^https?:\/\//i.test(keyOrUrl);
  const body = isUrl ? { url: keyOrUrl } : { key: keyOrUrl };
  return api<DeleteMediaResponse>("/api/v1/uploads", {
    method: "DELETE",
    json: body,
  });
}

// Bulk variant — used by course delete service + editor wipe
export async function deleteMediaBulk(
  keys: string[],
): Promise<DeleteMediaResponse> {
  if (keys.length === 0) {
    return { requested: 0, deleted: 0, failed: 0, failures: [] };
  }
  return api<DeleteMediaResponse>("/api/v1/uploads", {
    method: "DELETE",
    json: { keys },
  });
}

// ============================================================================
// validateFileForKind — pre-upload guard for UI (preview-time validation)
// ============================================================================
export function validateFileForKind(
  file: File,
  kind: UploadKind,
): string | null {
  const limit = SIZE_LIMITS[kind];
  if (file.size > limit) {
    const mb = (limit / 1024 / 1024).toFixed(0);
    return `File exceeds ${mb}MB limit`;
  }

  // Light MIME guard — backend enforces strict allowlist per kind
  if (kind === "course-demo-video" && !file.type.startsWith("video/")) {
    return "Only video files allowed";
  }
  if (
    (kind === "course-cover" ||
      kind === "course-thumb" ||
      kind === "course-content-image" ||
      kind === "user-avatar") &&
    !file.type.startsWith("image/")
  ) {
    return "Only image files allowed";
  }
  if (kind === "course-content-file" && !ALLOWED_FILE_MIME.test(file.type)) {
    return "Unsupported file type — allowed: PDF, Word, Excel, PowerPoint, ZIP, TXT, MD, CSV, JSON";
  }

  return null;
}
