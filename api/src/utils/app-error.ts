// ============================================================================
// app-error.ts — Custom error class for known/expected errors
// ============================================================================
// Industry pattern: 2 types ke errors hote hain:
//   1. OPERATIONAL errors — expected hain (404, 400, 401, 403). User galat input
//      diya, ya resource exist nahi karta. Inko handle karke clean response do.
//   2. PROGRAMMER errors — bugs hain (null reference, undefined access). Inko
//      Sentry pe bhejo, generic 500 user ko do.
//
// AppError = operational errors ke liye. `isOperational` flag se distinguish
// karte hain error handler middleware me.
// ============================================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string; // e.g. "USER_NOT_FOUND", "INVALID_OTP"

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Ye expected error hai, bug nahi
    this.code = code;

    // Stack trace clean rakhne ke liye — AppError constructor stack me na aaye
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common shortcuts — controllers me throw new BadRequest("...") likhna easy
export class BadRequest extends AppError {
  constructor(message = "Bad Request", code?: string) {
    super(message, 400, code);
  }
}

export class Unauthorized extends AppError {
  constructor(message = "Unauthorized", code?: string) {
    super(message, 401, code);
  }
}

export class Forbidden extends AppError {
  constructor(message = "Forbidden", code?: string) {
    super(message, 403, code);
  }
}

export class NotFound extends AppError {
  constructor(message = "Not Found", code?: string) {
    super(message, 404, code);
  }
}

export class Conflict extends AppError {
  constructor(message = "Conflict", code?: string) {
    super(message, 409, code);
  }
}
