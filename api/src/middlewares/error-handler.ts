// ============================================================================
// error-handler.ts — Central error handling middleware
// ============================================================================
// Express me errors ko centrally handle karna industry standard hai. Har
// controller me try/catch likhne se code dirty hota hai. Iske bajaye:
//   - Controllers me bas `throw new BadRequest("...")` ya `next(err)` karo
//   - Ye middleware sab errors ko ek jagah catch karke clean JSON response deta hai
//   - Unknown/programmer errors Sentry pe bhejega
//
// Express me error middleware ka signature 4-argument hota hai: (err, req, res, next)
// Express isi se identify karta hai ki ye error handler hai.
// ============================================================================

import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";
import { logger } from "../utils/logger.js";
import { Sentry } from "../lib/sentry.js";
import { env, isProd } from "../config/env.js";

// ----------------------------------------------------------------------------
// 404 handler — koi route match nahi hua to ye chalega
// app.ts me sabhi routes ke BAAD mount hoga
// ----------------------------------------------------------------------------
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
}

// ----------------------------------------------------------------------------
// Main error handler — sab errors yaha aate hain
// ----------------------------------------------------------------------------
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction, // Express ko 4-arg signature chahiye, isliye unused bhi rakhna padta hai
) {
  // ===== Case 1: Zod validation error =====
  // Validate middleware ya manual parse() se aaya hai → 400 with field details
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        // Field-level errors — frontend isi se form errors dikhayega
        issues: err.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
    });
  }

  // ===== Case 2: Known AppError (operational) =====
  // Hum ne khud throw kiya hai → status + message wahi use karo
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code ?? "APP_ERROR",
        message: err.message,
      },
    });
  }

  // ===== Case 3: Unknown error (bug / programmer error) =====
  // Ye unexpected hai → Sentry pe bhejo, log karo, generic 500 do
  // User ko internal details kabhi expose nahi karte (security risk)

  const errorObj = err instanceof Error ? err : new Error(String(err));

  logger.error(
    {
      err: errorObj,
      method: req.method,
      url: req.originalUrl,
    },
    "Unhandled error",
  );

  // Sentry capture (sirf agar DSN configured hai)
  if (env.SENTRY_DSN) {
    Sentry.captureException(errorObj);
  }

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      // Prod me message hide — kabhi kabhi stack trace ya DB error message
      // accidentally leak ho jata hai. Dev me debugging ke liye dikhayenge.
      message: isProd ? "Something went wrong" : errorObj.message,
    },
  });
}
