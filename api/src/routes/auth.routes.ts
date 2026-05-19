// ============================================================================
// auth.routes.ts — Auth-related custom routes
// ============================================================================
// IMPORTANT:
//   - /api/auth/* routes Better Auth khud handle karta hai (server.ts me mount)
//     — signup, signin, signout, OAuth callbacks, verify, reset — sab automatic
//   - Yaha hum SIRF apne custom routes daalte hain jaise /me, /update-profile
//
// Convention: feature ke routes alag file me — auth.routes, course.routes, etc.
// app.ts unko mount karta hai with version prefix.
// ============================================================================

import { Router } from "express";
import { requireAuth } from "../middlewares/require-auth.js";

const router = Router();

// ----------------------------------------------------------------------------
// GET /me — current logged-in user info
// ----------------------------------------------------------------------------
// Frontend isko call karke "logged-in hain ya nahi" check karega.
// Industry me ye endpoint har auth-protected app me hota hai.
// http://localhost:8080/api/v1/auth/me
router.get("/me", requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      session: {
        // Session details — security ke liye sab nahi, sirf safe fields
        expiresAt: req.session?.expiresAt,
      },
    },
  });
});

export default router;
