// ============================================================================
// course.routes.ts — Course endpoints (public list/detail + admin CRUD)
// ============================================================================
// Mounted at: /api/v1/courses
//
// Public:
//   GET    /                       → list with filters/search/sort
//   GET    /:slug                  → detail by slug
//
// Instructor / Admin:
//   POST   /                       → create
//   PATCH  /:id                    → update
//   POST   /:id/modules            → create module
//   PATCH  /:id/modules/:childId   → update module
//   DELETE /:id/modules/:childId   → delete module
//   POST   /:id/faqs               → create FAQ
//   PATCH  /:id/faqs/:childId      → update FAQ
//   DELETE /:id/faqs/:childId      → delete FAQ
//
// Admin only:
//   DELETE /:id                    → delete course
// ============================================================================

import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/require-auth.js";
import { validate } from "../middlewares/validate.js";
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
} from "../validators/course.validator.js";
import * as courseController from "../controllers/course.controller.js";

const router = Router();

// ============================================================================
// Public routes
// ============================================================================

// GET /api/v1/courses?status=LIVE&level=BEGINNER&q=react&page=1&limit=12&sort=popular
router.get(
  "/",
  validate({ query: listCoursesQuerySchema }),
  courseController.listCourses,
);

// GET /api/v1/courses/:slug
router.get(
  "/:slug",
  validate({ params: slugParamSchema }),
  courseController.getCourseBySlug,
);

// ============================================================================
// Authenticated routes (INSTRUCTOR or ADMIN)
// ============================================================================

// POST /api/v1/courses
router.post(
  "/",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ body: createCourseSchema }),
  courseController.createCourse,
);

// PATCH /api/v1/courses/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("INSTRUCTOR", "ADMIN"),
  validate({ params: idParamSchema, body: updateCourseSchema }),
  courseController.updateCourse,
);

// DELETE /api/v1/courses/:id — admin only (additional check in service)
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: idParamSchema }),
  courseController.deleteCourse,
);

// ============================================================================
// Module sub-resource
// ============================================================================
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

// ============================================================================
// FAQ sub-resource
// ============================================================================
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
