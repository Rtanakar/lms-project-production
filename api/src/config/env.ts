// ============================================================================
// env.ts — Environment variables ka single source of truth
// ============================================================================
// Industry approach: process.env ko directly use NAHI karte poore codebase me.
// Kyon? Kyunki:
//   1. Typo ho sakta hai (process.env.PROT vs process.env.PORT) — runtime tak pata nahi chalega
//   2. Type safety nahi (sab string | undefined hota hai)
//   3. Missing env ka error production me random jagah crash karega
//
// Solution: Zod se ek baar validate karo app start hote hi. Agar koi required
// env missing/invalid hai to app turant fail-fast ho jaye (crash on boot,
// not on first request). Iss file se `env` object import karke use karenge.
// ============================================================================

import { z } from "zod";
import dotenv from "dotenv";

// .env file load karo — server.ts me bhi load hota hai, but yaha bhi safe-call
// kar rahe hain kyunki ye file kabhi bhi pehle import ho sakti hai.
dotenv.config();

// Zod schema — har env variable ka shape + default value yaha define hota hai
const envSchema = z.object({
  // ===== App =====
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8080), // coerce: string "8080" → number 8080
  API_PREFIX: z.string().default("api"),
  API_VERSION: z.string().default("v1"),
  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  // ===== Database =====
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // ===== Redis (Upstash) =====
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  // ===== Better Auth =====
  BETTER_AUTH_SECRET: z
    .string()
    .min(16, "BETTER_AUTH_SECRET must be >=16 chars"),
  BETTER_AUTH_URL: z.string().url(),

  // ===== Sentry =====
  // Optional — dev me DSN na ho to bhi app chalega
  SENTRY_DSN: z.string().url().optional().or(z.literal("")),
});

// Validate karo — agar fail hua to detailed error print karke process kill
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // z.treeifyError() ya .format() — readable error tree
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1); // Fail-fast: app start hi nahi hoga
}

// Type-safe env object — IDE me autocomplete + compile-time check milega
export const env = parsed.data;

// Helper booleans — convenience ke liye, baar baar string compare nahi karna padega
export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
