// ============================================================================
// server.ts — App entry point (bootstrap + graceful shutdown)
// ============================================================================
// IMPORTANT IMPORT ORDER:
//   1. Sentry SABSE PEHLE — taaki wo modules ko instrument kar sake jab wo load ho
//   2. env validation — fail-fast agar config galat hai
//   3. app + auth + everything else
// ============================================================================

// Ye import sabse upar — order CRITICAL hai
import "./src/lib/sentry.js";

import express from "express";
import { toNodeHandler } from "better-auth/node";
import { env } from "./src/config/env.js";
import app from "./src/app.js";
import { auth } from "./src/lib/auth.js";
import { logger } from "./src/utils/logger.js";
import { prisma } from "./src/db/db.js";
import { printStartupBanner } from "./src/utils/startup-banner.js";

// ===== Better Auth handler =====
// Auth handler ko JSON parser ke PEHLE mount karte hain — kyunki better-auth
// raw body ko apne tarike se parse karta hai. JSON middleware pehle laga
// diya to better-auth tut jata hai.
app.all("/api/auth/{*any}", toNodeHandler(auth));

// Ab JSON parser mount — baaki routes ke liye
app.use(express.json({ limit: "1mb" }));

// ===== Server start =====
const server = app.listen(env.PORT, () => {
  // Async banner — DB ping aur service checks parallel me chalenge
  // Banner aane se pehle server already listening hai (clients reject nahi honge)
  void printStartupBanner(env.PORT).catch((err) => {
    logger.error({ err }, "Startup banner failed");
  });
});

// ============================================================================
// Graceful shutdown — production me MUST hai
// ============================================================================
// Kyon? Jab Kubernetes/Docker container ko kill signal bhejta hai (SIGTERM),
// hume:
//   1. Naye requests accept karna band karna hai
//   2. Pending requests complete hone dene hain
//   3. DB connections close karne hain (warna leaks)
//   4. Phir process exit
//
// Agar ye nahi kiya to deploy ke time half-completed requests fail honge.
// ============================================================================

let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) return; // double-call protect (SIGTERM + uncaughtException jaisa)
  isShuttingDown = true;

  logger.warn(`${signal} received — initiating graceful shutdown...`);

  // 1. Naye connections band karo, existing ko complete hone do
  server.close(async () => {
    logger.info("HTTP server closed — no new connections");

    try {
      // 2. Prisma connection pool close
      await prisma.$disconnect();
      logger.info("Database disconnected cleanly");
    } catch (err) {
      logger.error({ err }, "Error during DB disconnect");
    }

    logger.info("Shutdown complete. Bye!");
    process.exit(0);
  });

  // Safety net — 10s me bhi shutdown nahi hua to force kill
  // (warna deployment hang ho jayega)
  setTimeout(() => {
    logger.fatal("Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10_000).unref(); // unref → ye timer khud event loop ko alive nahi rakhega
}

process.on("SIGTERM", () => shutdown("SIGTERM")); // Docker/K8s ka kill signal
process.on("SIGINT", () => shutdown("SIGINT")); // Ctrl+C local me

// Uncaught errors — last line of defense
process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled Promise Rejection");
  void shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught Exception");
  void shutdown("uncaughtException");
});
