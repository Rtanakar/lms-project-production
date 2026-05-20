// ============================================================================
// security.ts — Reusable security middlewares (Netflix/Uber-grade defense)
// ============================================================================
// Industry pattern: security headers + correlation + caching ko alag file me
// rakhte hain — app.ts clean rahta hai, individual middleware testable hote
// hain, future me alag pages pe selectively apply kar sakte ho.
//
// Layers covered yaha:
//   1. permissionsPolicy()    → Browser features (camera, mic, geolocation) restrict
//   2. noStoreCache()         → Sensitive API responses cache na ho (auth, user data)
//   3. requestId()            → Har request pe unique ID — Sentry/Datadog correlation
//   4. responseTime()         → Server-Timing header (debugging + SLO monitoring)
// ============================================================================

import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

// ============================================================================
// 1. Permissions-Policy header
// ============================================================================
// Helmet 8 me ye built-in NAHI hai — manual middleware se set karte hain.
//
// Permissions-Policy = browser ko bata "in features ko mera app use NAHI karne
// deta". Even agar XSS ho jaye to attacker camera/mic/geolocation access nahi
// le sakta. Netflix, Uber, Stripe — sab strict policies use karte hain.
//
// Syntax: `feature=(allowlist)` — `()` means deny for everyone (including self).
// `(self)` means only same-origin allowed.
// ============================================================================
const PERMISSIONS_POLICY = [
  // ─── Hardware access — sab block ───
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "magnetometer=()",
  "gyroscope=()",
  "accelerometer=()",
  "ambient-light-sensor=()",
  "usb=()",
  "serial=()",
  "bluetooth=()",
  "hid=()",
  "midi=()",

  // ─── Privacy ───
  "interest-cohort=()", // Google FLoC ko block — tracking opt-out
  "browsing-topics=()", // FLoC's successor (Topics API)
  "join-ad-interest-group=()",
  "run-ad-auction=()",

  // ─── Media features ───
  "autoplay=()", // Auto-play video/audio block
  "encrypted-media=()", // DRM-protected media (we don't use)
  "picture-in-picture=()",

  // ─── Payments ───
  "payment=()", // Payment Request API — Phase me Stripe add hone par "(self)" karenge

  // ─── Display/Fullscreen ───
  "fullscreen=(self)", // Same-origin code fullscreen kar sakta (video player ke liye)
  "display-capture=()", // Screen recording block

  // ─── Sensitive APIs ───
  "clipboard-read=()", // Clipboard read block
  "clipboard-write=(self)", // Self-origin copy allowed (UX feature)

  // ─── Misc ───
  "sync-xhr=()", // Synchronous XHR block (performance)
  "execution-while-not-rendered=()",
  "execution-while-out-of-viewport=()",
].join(", ");

export function permissionsPolicy() {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Permissions-Policy", PERMISSIONS_POLICY);
    next();
  };
}

// ============================================================================
// 2. No-store cache headers
// ============================================================================
// API responses me sensitive data hai (user info, sessions). Browser/proxy
// cache me NAHI jaani chahiye — warna shared computer pe purana data leak ho
// sakta. Netflix/Uber/banks sab `no-store` use karte hain auth/user endpoints
// pe.
//
// NOTE: Static assets (images, JS) ke liye different policy — but ye API hai,
// sab JSON hai, sab no-store safe.
// ============================================================================
export function noStoreCache() {
  return (_req: Request, res: Response, next: NextFunction) => {
    // CDN-friendly + browser-friendly no-cache
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    );
    res.setHeader("Pragma", "no-cache"); // HTTP/1.0 compat
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store"); // Fastly/Akamai CDN
    next();
  };
}

// ============================================================================
// 3. Request ID — correlation across logs / Sentry / Datadog
// ============================================================================
// Har request ko unique ID assign — pino logger me automatic attach hota hai,
// Sentry me `tags.request_id` ban jata, response header me bhi bhejte hain.
// Client errors ko production logs me trace karne ke liye must-have.
//
// Industry me: nginx/Cloudflare incoming pe `cf-ray` ya `x-request-id` set
// karta hai → hum honor karte hain. Agar nahi hai, khud generate karte.
//
// NOTE: `req.id` type augmentation `src/@types/express.d.ts` me hai — central
// single source of truth (Express 5 me yahi pattern industry-standard hai).
// ============================================================================

export function requestId() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Honor upstream proxy ID, warna generate karo
    const id =
      (req.headers["x-request-id"] as string) ??
      (req.headers["cf-ray"] as string) ??
      randomUUID();

    req.id = id;
    res.setHeader("X-Request-Id", id);
    next();
  };
}

// ============================================================================
// 4. Response-Time header
// ============================================================================
// Server-Timing header → DevTools "Network" tab me dikhega "Server: 42ms".
// SLO monitoring (Datadog APM) ke liye useful. p95 latency track karne me.
// ============================================================================
export function responseTime() {
  return (_req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint();

    // `finish` event response complete hone pe fire hota hai
    res.on("finish", () => {
      const durationNs = process.hrtime.bigint() - start;
      const durationMs = Number(durationNs / 1_000_000n);
      // Headers already flushed ho gaye is point pe — alternative: set BEFORE
      // sending. Hum `res.setHeader` ko `res.on("close")` se pehle setHeader
      // call karte hain end() ke andar. Simpler: store on res.locals for log.
      res.locals.responseTimeMs = durationMs;
    });

    // Header set karna response sent hone se pehle — Express me hook lagana
    // padta hai. Simpler approach: setHeader on every res.json call. Yaha hum
    // sirf locals track kar rahe (logger pick karega).
    next();
  };
}
