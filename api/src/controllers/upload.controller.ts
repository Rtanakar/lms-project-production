// ============================================================================
// upload.controller.ts — Presigned URL endpoint handler
// ============================================================================
// Thin controller — delegates to r2.generatePresignedUploadUrl().
// MIME + size validation happens INSIDE r2.ts (single source of truth).
// ============================================================================

import type { Request, Response, NextFunction } from "express";
import { generatePresignedUploadUrl } from "../lib/r2.js";
import { BadRequest } from "../utils/app-error.js";
import type { PresignUploadInput } from "../validators/upload.validator.js";

// ============================================================================
// POST /api/v1/uploads/presigned
// ============================================================================
// Auth: INSTRUCTOR or ADMIN only (gated by middleware on the route).
//
// Body:  { kind, contentType, filename, sizeBytes }
// Reply: { uploadUrl, publicUrl, key, headers }
//
// Frontend then:
//   1. PUT uploadUrl with file body + headers
//   2. Use publicUrl in course form / TipTap content
// ============================================================================
export async function createPresignedUploadUrlHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = req.validated!.body as PresignUploadInput;

    // r2 library throws Error on MIME / size mismatch — translate to BadRequest
    let result;
    try {
      result = await generatePresignedUploadUrl(input);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid upload request";
      throw new BadRequest(message, "UPLOAD_INVALID");
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
