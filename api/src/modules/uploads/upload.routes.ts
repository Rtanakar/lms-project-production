// ============================================================================
// upload.routes.ts — R2 presigned URL + delete routes
// ============================================================================
// Mounted at: /api/v1/uploads
// ============================================================================

import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/require-auth.js";
import { validate } from "../../middlewares/validate.js";
import {
  deleteUploadSchema,
  presignUploadSchema,
} from "./upload.validator.js";
import {
  createPresignedUploadUrlHandler,
  deleteUploadHandler,
} from "./upload.controller.js";

const router = Router();

// ─── POST /presigned — get signed PUT URL for direct R2 upload ────────────
router.post(
  "/presigned",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ body: presignUploadSchema }),
  createPresignedUploadUrlHandler,
);

// ─── DELETE / — remove R2 object(s) by key / url / bulk ───────────────────
// Express 5: DELETE with JSON body is supported (no special middleware needed).
router.delete(
  "/",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ body: deleteUploadSchema }),
  deleteUploadHandler,
);

export default router;
