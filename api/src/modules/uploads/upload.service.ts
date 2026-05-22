// ============================================================================
// upload.service.ts — Presign + delete business logic (wraps r2 lib)
// ============================================================================
// Layered architecture (Controller → Service → Repository/Lib). Service:
//   - Adapts r2 lib errors to AppError variants (BadRequest, NotFound)
//   - Coordinates bulk operations + best-effort error handling
//   - Future: per-user quota tracking, audit logs, virus-scan callbacks
// ============================================================================

import {
  deleteR2Object,
  generatePresignedUploadUrl,
  keyFromPublicUrl,
} from "../../lib/r2.js";
import { BadRequest } from "../../utils/app-error.js";
import { logger } from "../../utils/logger.js";
import type {
  DeleteUploadInput,
  PresignUploadInput,
} from "./upload.validator.js";

// ============================================================================
// Presigned URL — single-call signing
// ============================================================================
export async function createPresignedUploadUrl(input: PresignUploadInput) {
  try {
    return await generatePresignedUploadUrl(input);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid upload request";
    throw new BadRequest(message, "UPLOAD_INVALID");
  }
}

// ============================================================================
// Delete — single or bulk, best-effort
// ============================================================================
// Strategy:
//   - Collect all keys to delete (resolve `url` → key, then merge with `keys[]`)
//   - Promise.allSettled → continue on individual failures (e.g., already gone)
//   - Return summary { requested, deleted, failed } so caller can log/report
//
// Why best-effort?
//   - R2 deletes are idempotent (delete-nonexistent = 204)
//   - Cleanup is "nice to have" — failures shouldn't block course-edit flow
//   - Network blips are common; user can retry deletion later
// ============================================================================
export interface DeleteUploadResult {
  requested: number;
  deleted: number;
  failed: number;
  failures: Array<{ key: string; reason: string }>;
}

export async function deleteUpload(
  input: DeleteUploadInput,
): Promise<DeleteUploadResult> {
  // ─── 1. Normalize input → unique list of keys ───
  const keysSet = new Set<string>();
  if (input.key) keysSet.add(input.key);
  if (input.url) {
    const fromUrl = keyFromPublicUrl(input.url);
    if (fromUrl) keysSet.add(fromUrl);
  }
  if (input.keys) for (const k of input.keys) keysSet.add(k);

  const keys = [...keysSet];
  if (keys.length === 0) {
    throw new BadRequest(
      "No valid key resolved from input",
      "DELETE_NO_KEYS",
    );
  }

  // ─── 2. Best-effort bulk delete ───
  const results = await Promise.allSettled(
    keys.map((k) => deleteR2Object(k)),
  );

  const failures: DeleteUploadResult["failures"] = [];
  let deleted = 0;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled") {
      deleted++;
    } else {
      const reason =
        r.reason instanceof Error ? r.reason.message : String(r.reason);
      failures.push({ key: keys[i], reason });
      logger.warn(
        { key: keys[i], reason },
        "[uploads] R2 delete failed (continuing)",
      );
    }
  }

  return {
    requested: keys.length,
    deleted,
    failed: failures.length,
    failures,
  };
}
