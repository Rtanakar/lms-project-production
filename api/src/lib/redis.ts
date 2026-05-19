// ============================================================================
// redis.ts — Upstash Redis client (REST-based)
// ============================================================================
// 2 types ke Redis usage:
//   1. Upstash REST (@upstash/redis)  → Better Auth secondaryStorage + rate-limit cache
//      - HTTP based, fast cold-starts, edge-compatible
//   2. ioredis (TCP)                  → BullMQ queues (Phase 5 me)
//      - Persistent TCP connection, lower latency for high-throughput
//
// Yaha sirf #1 setup kar rahe hain — Phase 5 me ioredis client alag banayenge.
// ============================================================================

import { Redis } from "@upstash/redis";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

// Sirf tab init karo jab REST creds dono ho — warna null rahega
// (Better Auth secondaryStorage optional hai — graceful degrade)
export const upstash =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

if (!upstash) {
  logger.warn(
    "Upstash Redis not configured — Better Auth using in-memory storage (DEV ONLY)",
  );
}
