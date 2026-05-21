// ============================================================================
// course.controller.ts — HTTP layer (thin — delegates to service)
// ============================================================================

import type { Request, Response, NextFunction } from "express";
import * as courseService from "./course.service.js";
import type {
  CreateCourseInput,
  UpdateCourseInput,
  ListCoursesQuery,
  CreateModuleInput,
  UpdateModuleInput,
  CreateFAQInput,
  UpdateFAQInput,
  ArchiveCourseInput,
} from "./course.validator.js";

// ============================================================================
// LIST — GET /api/v1/courses
// ============================================================================
export async function listCourses(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = req.validated!.query as ListCoursesQuery;
    const result = await courseService.listCourses(query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// GET BY SLUG — GET /api/v1/courses/:slug
// ============================================================================
export async function getCourseBySlug(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { slug } = req.validated!.params as { slug: string };
    const course = await courseService.getCourseBySlug(slug);
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// CREATE — POST /api/v1/courses
// ============================================================================
export async function createCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = req.validated!.body as CreateCourseInput;
    const course = await courseService.createCourse(input, req.user!.id);
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// UPDATE — PATCH /api/v1/courses/:id
// ============================================================================
export async function updateCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.validated!.params as { id: string };
    const input = req.validated!.body as UpdateCourseInput;
    const user = req.user! as { id: string; role: string };
    const course = await courseService.updateCourse(id, input, user);
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// ARCHIVE — POST /api/v1/courses/:id/archive (owner / admin)
// ============================================================================
// Soft delete via status flip — preserves enrollments + analytics, reversible.
// ============================================================================
export async function archiveCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.validated!.params as { id: string };
    const input = (req.validated?.body ?? {}) as ArchiveCourseInput;
    const user = req.user! as { id: string; role: string };
    const course = await courseService.archiveCourse(id, user, input);
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// RESTORE — POST /api/v1/courses/:id/restore (owner / admin)
// ============================================================================
// Restores ARCHIVED → DRAFT. Owner must re-publish explicitly.
// ============================================================================
export async function restoreCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.validated!.params as { id: string };
    const user = req.user! as { id: string; role: string };
    const course = await courseService.restoreCourse(id, user);
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// DELETE — DELETE /api/v1/courses/:id (admin only — HARD delete)
// ============================================================================
export async function deleteCourse(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.validated!.params as { id: string };
    await courseService.deleteCourse(id, req.user! as { role: string });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// MODULES — nested under /courses/:id/modules
// ============================================================================
export async function createModule(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.validated!.params as { id: string };
    const input = req.validated!.body as CreateModuleInput;
    const user = req.user! as { id: string; role: string };
    const mod = await courseService.createModule(id, input, user);
    res.status(201).json({ success: true, data: mod });
  } catch (err) {
    next(err);
  }
}

export async function updateModule(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, childId } = req.validated!.params as {
      id: string;
      childId: string;
    };
    const input = req.validated!.body as UpdateModuleInput;
    const user = req.user! as { id: string; role: string };
    const mod = await courseService.updateModule(id, childId, input, user);
    res.json({ success: true, data: mod });
  } catch (err) {
    next(err);
  }
}

export async function deleteModule(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, childId } = req.validated!.params as {
      id: string;
      childId: string;
    };
    const user = req.user! as { id: string; role: string };
    await courseService.deleteModule(id, childId, user);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// FAQS — nested under /courses/:id/faqs
// ============================================================================
export async function createFAQ(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.validated!.params as { id: string };
    const input = req.validated!.body as CreateFAQInput;
    const user = req.user! as { id: string; role: string };
    const faq = await courseService.createFAQ(id, input, user);
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    next(err);
  }
}

export async function updateFAQ(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, childId } = req.validated!.params as {
      id: string;
      childId: string;
    };
    const input = req.validated!.body as UpdateFAQInput;
    const user = req.user! as { id: string; role: string };
    const faq = await courseService.updateFAQ(id, childId, input, user);
    res.json({ success: true, data: faq });
  } catch (err) {
    next(err);
  }
}

export async function deleteFAQ(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, childId } = req.validated!.params as {
      id: string;
      childId: string;
    };
    const user = req.user! as { id: string; role: string };
    await courseService.deleteFAQ(id, childId, user);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
