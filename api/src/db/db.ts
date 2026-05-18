// ============================================================================
// db.ts — Prisma Client singleton (Postgres via PG adapter)
// ============================================================================
// Prisma 7 me "driver adapters" pattern industry standard ban gaya hai.
// Hum @prisma/adapter-pg use kar rahe hain jo node-postgres (pg) ko underline
// driver banata hai. Benefits:
//   - Edge runtimes me bhi kaam karta hai (future-proof)
//   - Connection pooling pg ke through (battle-tested)
//   - Prisma engine ko binary ki zarurat kam, faster cold-start
//
// Singleton kyun? Har naya PrismaClient = naya connection pool. Dev me
// hot-reload pe leak ho ke "too many connections" error aata hai. globalThis
// pe cache karke avoid karte hain.
// ============================================================================

import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env, isDev } from "../config/env.js";

// PG adapter — pool config production tuning ke liye yaha
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

// Type-safe global cache (dev hot-reload safety)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    // Dev me query/warn/error log, prod me sirf error (noise kam)
    log: isDev ? ["query", "warn", "error"] : ["error"],
  });

// Dev me hi global pe cache karo — prod me singleton already module cache se aa raha hai
if (isDev) globalForPrisma.prisma = prisma;
