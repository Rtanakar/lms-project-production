// ============================================================================
// course.routes.ts — Course endpoints (public list/detail + instructor/admin CRUD)
// ============================================================================
// Mounted at: /api/v1/courses
// ============================================================================

import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/require-auth.js";
import { validate } from "../../middlewares/validate.js";
import {
  createCourseSchema,
  updateCourseSchema,
  listCoursesQuerySchema,
  createModuleSchema,
  updateModuleSchema,
  createFAQSchema,
  updateFAQSchema,
  slugParamSchema,
  idParamSchema,
  courseAndChildParamSchema,
  archiveCourseSchema,
} from "./course.validator.js";
import * as courseController from "./course.controller.js";

const router = Router();

// ─── Public ──────────────────────────────────────────────────────────────────

router.get(
  "/",
  validate({ query: listCoursesQuerySchema }),
  courseController.listCourses,
);

router.get(
  "/:slug",
  validate({ params: slugParamSchema }),
  courseController.getCourseBySlug,
);

// ─── INSTRUCTOR / ADMIN ──────────────────────────────────────────────────────

router.post(
  "/",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ body: createCourseSchema }),
  courseController.createCourse,
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ params: idParamSchema, body: updateCourseSchema }),
  courseController.updateCourse,
);

// ─── Archive / Restore (owner / admin — soft delete via status flip) ────────

router.post(
  "/:id/archive",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ params: idParamSchema, body: archiveCourseSchema }),
  courseController.archiveCourse,
);

router.post(
  "/:id/restore",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ params: idParamSchema }),
  courseController.restoreCourse,
);

// ─── Hard delete (ADMIN only — irreversible, cascades modules + FAQs) ───────

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: idParamSchema }),
  courseController.deleteCourse,
);

// ─── Modules ─────────────────────────────────────────────────────────────────

router.post(
  "/:id/modules",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ params: idParamSchema, body: createModuleSchema }),
  courseController.createModule,
);

router.patch(
  "/:id/modules/:childId",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ params: courseAndChildParamSchema, body: updateModuleSchema }),
  courseController.updateModule,
);

router.delete(
  "/:id/modules/:childId",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ params: courseAndChildParamSchema }),
  courseController.deleteModule,
);

// ─── FAQs ────────────────────────────────────────────────────────────────────

router.post(
  "/:id/faqs",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ params: idParamSchema, body: createFAQSchema }),
  courseController.createFAQ,
);

router.patch(
  "/:id/faqs/:childId",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ params: courseAndChildParamSchema, body: updateFAQSchema }),
  courseController.updateFAQ,
);

router.delete(
  "/:id/faqs/:childId",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ params: courseAndChildParamSchema }),
  courseController.deleteFAQ,
);

export default router;
