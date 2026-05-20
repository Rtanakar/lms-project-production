// ============================================================================
// express.d.ts — Express Request type augmentation
// ============================================================================
// Declaration merging se Express.Request interface ko extend karte hain.
// Iss se controllers me type-safe access milta hai bina any cast ke.
//
// Properties added:
//   - req.id         → security.ts (requestId middleware) — correlation tracking
//   - req.validated  → Zod validate middleware ka output
//   - req.user       → require-auth middleware ke baad authenticated user
//   - req.session    → require-auth middleware ke baad session info
//
// ⚠️ ALL Request augmentations CENTRAL yahaan rakho — security.ts/middleware
// files me declare karoge to:
//   - Express 5 me `express-serve-static-core` module name resolve nahi hota
//   - Duplicate augmentations bich-bich me TS confuse karte hain
//   - Industry standard: ek `@types/express.d.ts` = single source of truth
// ============================================================================

import type { AuthUser, Session } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      /**
       * Unique request ID — `requestId()` middleware set karta hai (security.ts).
       * Pino logs, Sentry breadcrumbs, X-Request-Id response header — sab me
       * consistent. Distributed tracing ke liye must-have.
       */
      id?: string;

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
