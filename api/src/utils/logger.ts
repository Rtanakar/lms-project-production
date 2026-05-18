// ============================================================================
// logger.ts — Pino logger setup
// ============================================================================
// Industry me console.log NAHI use karte production me. Kyon?
//   1. console.log SYNCHRONOUS hai → event loop block karta hai under load
//   2. No log levels (info/warn/error filtering nahi)
//   3. No structured JSON → log aggregators (Datadog, Loki, Better Stack) parse nahi kar paate
//   4. No request correlation IDs
//
// Pino: fastest Node.js logger, JSON output by default, async, structured.
// Dev me readable format chahiye → pino-pretty use karte hain.
// Prod me raw JSON → log aggregator ke liye perfect.
// ============================================================================

import pino from "pino";
import { env, isDev } from "../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,

  // Dev me pretty-print (colored, human-readable). Prod me raw JSON.
  // pino-pretty ko transport ke through use karte hain (worker thread me chalega,
  // main thread block nahi hoga).
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:HH:MM:ss.l", // readable timestamp
          ignore: "pid,hostname", // noise hata do dev me
        },
      }
    : undefined,

  // Production me sensitive fields automatic redact ho jayenge logs me
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.token",
      "*.secret",
    ],
    censor: "[REDACTED]",
  },
});
