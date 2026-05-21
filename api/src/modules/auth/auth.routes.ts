// ============================================================================
// auth.routes.ts — Custom auth routes (/me etc.)
// ============================================================================
// NOTE: Better Auth's /api/auth/* endpoints (sign-up, sign-in, OAuth) are
// mounted directly in app.ts via `toNodeHandler(auth)`. This file is for
// CUSTOM routes ke liye (e.g., /me) jo Better Auth nahi cover karta.
// ============================================================================

import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth.js";

const router = Router();

// ─── GET /me — current logged-in user info ───────────────────────────────────
// Frontend isko call karke "logged-in hai ya nahi" + role + emailVerified check
router.get("/me", requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      session: {
        expiresAt: req.session?.expiresAt,
      },
    },
  });
});

export default router;
