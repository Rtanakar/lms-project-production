// ============================================================================
// upload.routes.ts — R2 presigned URL routes
// ============================================================================
// Mounted at: /api/v1/uploads
// ============================================================================

import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/require-auth.js";
import { validate } from "../../middlewares/validate.js";
import { presignUploadSchema } from "./upload.validator.js";
import { createPresignedUploadUrlHandler } from "./upload.controller.js";

const router = Router();

router.post(
  "/presigned",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ body: presignUploadSchema }),
  createPresignedUploadUrlHandler,
);

export default router;
