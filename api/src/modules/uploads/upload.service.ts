// ============================================================================
// upload.service.ts — Presigned URL business logic (wraps r2 lib)
// ============================================================================
// Even though logic is thin, service layer exists for:
//   1. Consistent pattern across all modules
//   2. Future: add quota checks (per-user upload limits), audit logging,
//      MIME deep validation (file magic bytes), virus scanning callbacks
//   3. Testable in isolation (mock r2 lib)
// ============================================================================

import { generatePresignedUploadUrl } from "../../lib/r2.js";
import { BadRequest } from "../../utils/app-error.js";
import type { PresignUploadInput } from "./upload.validator.js";

export async function createPresignedUploadUrl(input: PresignUploadInput) {
  // r2 library throws plain Error on MIME/size mismatch — translate to BadRequest
  try {
    return await generatePresignedUploadUrl(input);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid upload request";
    throw new BadRequest(message, "UPLOAD_INVALID");
  }
}
