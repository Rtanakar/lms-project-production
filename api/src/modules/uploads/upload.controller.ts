// ============================================================================
// upload.controller.ts — Presigned URL endpoint
// ============================================================================

import type { Request, Response, NextFunction } from "express";
import * as uploadService from "./upload.service.js";
import type { PresignUploadInput } from "./upload.validator.js";

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
