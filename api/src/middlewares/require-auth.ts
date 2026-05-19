// ============================================================================
// require-auth.ts — Authentication guard middleware
// ============================================================================
// Protected routes pe use karna:
//   router.get("/me", requireAuth, meController);
//   router.post("/courses", requireAuth, requireRole("INSTRUCTOR"), createCourse);
//
// Kaise kaam karta hai:
//   1. Better-auth se session fetch (cookie/token se)
//   2. Session nahi mili → 401 Unauthorized
//   3. Mili → req.user + req.session attach, next()
//
// Industry pattern: auth-check ek hi jagah, controllers clean rahe.
// ============================================================================

import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { Unauthorized, Forbidden } from "../utils/app-error.js";

// ----------------------------------------------------------------------------
// requireAuth — koi bhi logged-in user
// ----------------------------------------------------------------------------
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Better-auth ko Express headers ko Node Headers format me convert karke do
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new Unauthorized("Authentication required", "NO_SESSION");
    }

    // Type-safe attach — express.d.ts me declare kiya hai
    req.user = session.user;
    req.session = session.session;
    next();
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------------------------------
// optionalAuth — user logged-in ho to attach, na ho to bhi proceed
// ----------------------------------------------------------------------------
// Use case: public courses page jo logged-in users ko personalized dikhata hai
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session) {
      req.user = session.user;
      req.session = session.session;
    }
    next();
  } catch {
    // Optional auth — failure pe bhi continue
    next();
  }
}

// ----------------------------------------------------------------------------
// requireRole — role-based access (RBAC)
// ----------------------------------------------------------------------------
// IMPORTANT: ye requireAuth ke BAAD chain hota hai (req.user already set)
//   router.post("/admin", requireAuth, requireRole("ADMIN"), handler);
export function requireRole(
  ...allowed: Array<"STUDENT" | "INSTRUCTOR" | "ADMIN">
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // requireAuth pehle nahi laga to programmer error
    if (!req.user) {
      return next(
        new Unauthorized(
          "requireAuth must run before requireRole",
          "AUTH_ORDER",
        ),
      );
    }

    // additionalFields se aaya hai — better-auth string return karta hai
    const role = (req.user as { role?: string }).role;

    if (
      !role ||
      !allowed.includes(role as "STUDENT" | "INSTRUCTOR" | "ADMIN")
    ) {
      return next(
        new Forbidden(
          `Insufficient role. Required: ${allowed.join(" or ")}`,
          "FORBIDDEN_ROLE",
        ),
      );
    }

    next();
  };
}
