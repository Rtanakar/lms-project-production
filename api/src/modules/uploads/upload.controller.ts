// ============================================================================
// upload.controller.ts — HTTP handlers (thin — delegates to service)
// ============================================================================

import type { Request, Response, NextFunction } from "express";
import * as uploadService from "./upload.service.js";
import type {
  DeleteUploadInput,
  PresignUploadInput,
} from "./upload.validator.js";

// ============================================================================
// POST /api/v1/uploads/presigned — sign URL for direct PUT to R2
// ============================================================================
export async function createPresignedUploadUrlHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = req.validated!.body as PresignUploadInput;
    const result = await uploadService.createPresignedUploadUrl(input);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// DELETE /api/v1/uploads — remove R2 object(s) by key / url / bulk
// ============================================================================
// Body shape (any one):
//   { key:  "course-cover/2026/05/uuid.png" }
//   { url:  "https://pub-xxx.r2.dev/course-cover/.../uuid.png" }
//   { keys: ["course-cover/...", "course-demo-video/..."] }
//
// Response: { requested, deleted, failed, failures: [...] }
// ============================================================================
export async function deleteUploadHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = req.validated!.body as DeleteUploadInput;
    const result = await uploadService.deleteUpload(input);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
