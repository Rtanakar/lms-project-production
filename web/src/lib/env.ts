// ============================================================================
// env.ts — Client/server-safe environment config
// ============================================================================
// Next.js me 2 types ke env vars:
//   1. NEXT_PUBLIC_*  → client + server dono jagah accessible (bundled)
//   2. SERVER-only    → process.env me sirf server-side (RSC/route handlers/proxy)
//
// LMS frontend ke liye backend URL public hona chahiye (browser se direct call).
// Hum Zod validate karte hain taki missing/typo turant pakda jaaye.
// ============================================================================

import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .default("http://localhost:8080"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
});

// Next.js inline-replaces process.env.NEXT_PUBLIC_* in bundle — destructure explicitly
// (computed access like process.env[key] doesn't work in client bundles)
const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!parsed.success) {
  // Build time pe hi crash ho jaayega — fail-fast
  console.error("Invalid client env:", parsed.error.format());
  throw new Error("Invalid client environment variables");
}

export const env = parsed.data;
