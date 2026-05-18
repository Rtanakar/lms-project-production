// ============================================================================
// express.d.ts — Express Request type augmentation
// ============================================================================
// Industry pattern: jab humein Request object pe custom properties chahiye
// (jaise validated data, current user, request ID), to "declaration merging"
// se Express.Request interface ko extend karte hain. Iss se controllers me
// type-safe access milta hai bina any cast ke.
//
// Example:
//   req.validated.body  → ZodInfer<typeof schema> (fully typed!)
//   req.user            → AuthenticatedUser (better-auth se set hoga later)
// ============================================================================

declare global {
  namespace Express {
    interface Request {
      /**
       * Zod se validate kiya hua request data.
       * `validate()` middleware isko set karta hai.
       * Generic type controller me cast karke milega.
       */
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

// Empty export — TypeScript ko bata raha hai ye module hai (declaration merging ke liye zaruri)
export {};
