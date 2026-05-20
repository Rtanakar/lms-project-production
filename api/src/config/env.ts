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
  // REDIS_URL → BullMQ (TCP via ioredis)
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  // REST API → Better Auth secondary storage (HTTP-based, faster cold starts)
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().or(z.literal("")),

  // ===== Better Auth =====
  BETTER_AUTH_SECRET: z
    .string()
    .min(16, "BETTER_AUTH_SECRET must be >=16 chars"),
  BETTER_AUTH_URL: z.string().url(),

  // ===== OAuth providers =====
  // Production me sab required, dev me optional (empty string allowed)
  GITHUB_CLIENT_ID: z.string().default(""),
  GITHUB_CLIENT_SECRET: z.string().default(""),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),

  // ===== Resend (email) =====
  // Dev me optional — agar nahi set ho to emails console pe log honge
  RESEND_API_KEY: z.string().default(""),
  RESEND_FROM_EMAIL: z.string().email().default("noreply@example.com"),

  // ===== Cloudflare R2 (S3-compatible storage) =====
  // Required for: course covers/thumbs, demo videos, TipTap embedded media
  R2_ACCOUNT_ID: z.string().min(1, "R2_ACCOUNT_ID is required"),
  R2_ACCESS_KEY_ID: z.string().min(1, "R2_ACCESS_KEY_ID is required"),
  R2_SECRET_ACCESS_KEY: z.string().min(1, "R2_SECRET_ACCESS_KEY is required"),
  R2_BUCKET_NAME: z.string().min(1, "R2_BUCKET_NAME is required"),
  // Public URL base (R2.dev domain or custom domain)
  R2_PUBLIC_URL: z.string().url("R2_PUBLIC_URL must be a valid URL"),

  // ===== Admin emails (comma separated) =====
  // Ye emails first signup pe automatically ADMIN role paayenge
  ADMIN_EMAILS: z.string().default(""),

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
