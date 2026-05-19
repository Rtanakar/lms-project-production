// ============================================================================
// express.d.ts — Express Request type augmentation
// ============================================================================
// Declaration merging se Express.Request interface ko extend karte hain.
// Iss se controllers me type-safe access milta hai bina any cast ke.
//
// Properties added:
//   - req.validated  → Zod validate middleware ka output
//   - req.user       → require-auth middleware ke baad authenticated user
//   - req.session    → require-auth middleware ke baad session info
// ============================================================================

import type { AuthUser, Session } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      /**
       * Zod se validate kiya hua request data.
       * `validate()` middleware set karta hai.
       */
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };

      /**
       * Authenticated user — `requireAuth` middleware ke baad available.
       * Public routes me undefined hoga.
       */
      user?: AuthUser;

      /**
       * Active session info — `requireAuth` middleware ke baad available.
       */
      session?: Session;
    }
  }
}

export {};
