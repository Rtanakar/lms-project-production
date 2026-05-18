// ============================================================================
// validate.ts — Zod-based request validation middleware
// ============================================================================
// Industry pattern: har route ka body/query/params Zod schema ke against
// validate karo BEFORE controller chale. Benefits:
//   - Controller ko clean typed data milta hai (no manual checks)
//   - Frontend ko consistent error format milta hai (errorHandler me ZodError catch hota hai)
//   - Single source of truth — same schema frontend pe bhi use ho sakta hai
//
// ⚠️ Express 5 NOTE:
//   Express 5 me req.query aur req.params READ-ONLY getters hain — directly
//   reassign karne pe TS aur runtime dono error karte hain (Express 4 me
//   yeh allowed tha). Isliye hum validated data ko req.validated me store
//   karte hain. Controller is tarah access karega:
//
//     const { name } = req.validated!.body as CreateUserInput;
//
//   Ya better — typed helper banake (Phase 2 me dikhayenge).
//
//   req.body assignable hai isliye usko bhi update kar dete hain (legacy
//   compatibility) — but PRIMARY source req.validated rahega.
// ============================================================================

import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";

interface ValidateSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schemas: ValidateSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Lazy init — pehli baar set karte waqt
      req.validated = req.validated ?? {};

      if (schemas.body) {
        // parse() throws ZodError on failure → errorHandler catch karega
        const parsed = schemas.body.parse(req.body) as unknown;
        req.validated.body = parsed;
        // req.body bhi update — Express 5 me ye assignable hai (sirf query/params read-only hain)
        req.body = parsed;
      }

      if (schemas.query) {
        // Express 5: req.query READ-ONLY → sirf req.validated.query me daalo
        req.validated.query = schemas.query.parse(req.query) as unknown;
      }

      if (schemas.params) {
        // Express 5: req.params bhi typically read-only — req.validated.params use karo
        req.validated.params = schemas.params.parse(req.params) as unknown;
      }

      next();
    } catch (err) {
      next(err); // ZodError → errorHandler me handle hoga
    }
  };
}
