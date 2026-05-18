// ============================================================================
// startup-banner.ts — Production-style boot diagnostics
// ============================================================================
// Jab app boot ho to clearly dikhe:
//   - Kaunsa env me chal raha (dev/prod)
//   - DB connected ya nahi
//   - Sentry on hai ya off
//   - Server kaha listen kar raha
//   - Build/runtime info
//
// Ye industry standard hai — Netflix, Vercel, etc. ke logs me boot ke time
// poori "system check" output aati hai. Debugging time bachata hai
// (immediately pata chal jata "DB down hai" vs "code crash hua").
// ============================================================================

import { prisma } from "../db/db.js";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

interface ServiceStatus {
  name: string;
  status: "ok" | "fail" | "skipped";
  detail?: string;
}

// ----------------------------------------------------------------------------
// DB connectivity check — actual query maar ke confirm karte hain
// ----------------------------------------------------------------------------
async function checkDatabase(): Promise<ServiceStatus> {
  try {
    // Lightweight ping query — sirf connection verify
    await prisma.$queryRaw`SELECT 1`;
    return { name: "PostgreSQL", status: "ok", detail: "connected" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { name: "PostgreSQL", status: "fail", detail: msg };
  }
}

// ----------------------------------------------------------------------------
// Sentry check — DSN configured hai ya nahi
// ----------------------------------------------------------------------------
function checkSentry(): ServiceStatus {
  if (!env.SENTRY_DSN) {
    return { name: "Sentry", status: "skipped", detail: "no DSN" };
  }
  return { name: "Sentry", status: "ok", detail: "tracking enabled" };
}

// ----------------------------------------------------------------------------
// Better Auth check — secret/URL set hai ya nahi
// ----------------------------------------------------------------------------
function checkBetterAuth(): ServiceStatus {
  if (!env.BETTER_AUTH_SECRET || !env.BETTER_AUTH_URL) {
    return { name: "Better Auth", status: "fail", detail: "config missing" };
  }
  return {
    name: "Better Auth",
    status: "ok",
    detail: `base: ${env.BETTER_AUTH_URL}`,
  };
}

// ----------------------------------------------------------------------------
// Main banner — sab checks chalakar pretty banner print karo
// ----------------------------------------------------------------------------
export async function printStartupBanner(port: number): Promise<void> {
  // Sab checks parallel me — koi block na ho
  const [db, sentry, auth] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkSentry()),
    Promise.resolve(checkBetterAuth()),
  ]);

  const services = [db, sentry, auth];
  const allOk = services.every((s) => s.status !== "fail");

  // Plain ASCII — Windows cmd safe (no emoji garbage)
  const line = "-".repeat(60);
  const baseUrl = `http://localhost:${port}/${env.API_PREFIX}/${env.API_VERSION}`;

  // Banner — info logger se ek single multiline ya separate lines
  logger.info(line);
  logger.info(`  LMS API Server`);
  logger.info(`  Environment : ${env.NODE_ENV.toUpperCase()}`);
  logger.info(`  Node        : ${process.version}`);
  logger.info(`  PID         : ${process.pid}`);
  logger.info(`  Base URL    : ${baseUrl}`);
  logger.info(`  Health      : ${baseUrl}/health`);
  logger.info(line);
  logger.info(`  Service Checks:`);

  for (const s of services) {
    const tag =
      s.status === "ok"
        ? "[ OK    ]"
        : s.status === "fail"
          ? "[ FAIL  ]"
          : "[ SKIP  ]";
    logger.info(`  ${tag}  ${s.name.padEnd(14)} ${s.detail ?? ""}`);
  }

  logger.info(line);

  if (allOk) {
    logger.info(`  Server is READY and accepting connections on port ${port}`);
  } else {
    logger.warn(`  Server started but some services FAILED — check above`);
  }
  logger.info(line);
}
