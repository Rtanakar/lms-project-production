// ============================================================================
// upload.routes.ts — R2 presigned URL routes
// ============================================================================
// Mounted at: /api/v1/uploads
//
// Endpoints:
//   POST /presigned   → returns { uploadUrl, publicUrl, key, expiresIn }
//                       Auth: INSTRUCTOR or ADMIN
// ============================================================================

import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/require-auth.js";
import { validate } from "../middlewares/validate.js";
import { presignUploadSchema } from "../validators/upload.validator.js";
import { createPresignedUploadUrlHandler } from "../controllers/upload.controller.js";

const router = Router();

// ----------------------------------------------------------------------------
// POST /presigned — create presigned PUT URL for direct browser-to-R2 upload
// ----------------------------------------------------------------------------
router.post(
  "/presigned",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ body: presignUploadSchema }),
  createPresignedUploadUrlHandler,
);

export default router;
