// ============================================================================
// app.ts — Express app configuration (Netflix/Uber-grade security)
// ============================================================================
// Middleware ORDER (industry production stack):
//   1.  Security headers (helmet)         ← har response pe
//   2.  Permissions-Policy                ← browser API restrictions
//   3.  No-store cache headers            ← sensitive data leak prevention
//   4.  Request ID                        ← log/Sentry correlation
//   5.  Response time tracking            ← SLO monitoring
//   6.  CORS                              ← cross-origin policy
//   7.  Better Auth handler               ← JSON parser se PEHLE
//   8.  Body parsers                      ← baaki routes ke liye
//   9.  Request logging (morgan→pino)
//  10.  Routes (health, /api/v1/*)
//  11.  404 handler
//  12.  Error handler (4-arg, sabse aakhir me)
// ============================================================================

import express, { type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { env, isDev, isProd } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import {
  permissionsPolicy,
  noStoreCache,
  requestId,
  responseTime,
} from "./middlewares/security.js";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();

// ─── Express native hardening ───
// Server version fingerprint hide (extra layer; helmet bhi karta hai)
app.disable("x-powered-by");

// Trust first proxy in production — nginx/ALB/Vercel ke peeche chalega.
// `req.ip` aur `req.protocol` correct values denge (warna rate limit + logs
// galat IP pe lagenge).
if (isProd) app.set("trust proxy", 1);

// ETag responses me sensitive data ka hash leak kar sakta — disable.
// (Netflix-grade — defense in depth)
app.set("etag", false);

// ============================================================================
// 1. Helmet — HTTP security headers
// ============================================================================
// REST API context optimized:
//   - CSP        → prod me strict default-src 'self'; dev me OFF (debug-friendly)
//   - HSTS       → prod me 1-year + preload; dev OFF (http://localhost)
//   - COEP       → OFF (Better Auth OAuth flow conflict)
//   - CORP       → "cross-origin" (frontend at different port can fetch)
//   - COOP       → same-origin-allow-popups (OAuth popups work)
//   - X-Frame    → DENY (clickjacking)
//   - Referrer   → no-referrer (URL leakage)
// ============================================================================
app.use(
  helmet({
    // ----- Content Security Policy -----
    contentSecurityPolicy: isProd
      ? {
          useDefaults: false,
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
          },
        }
      : false,

    // ----- HSTS -----
    strictTransportSecurity: isProd
      ? {
          maxAge: 60 * 60 * 24 * 365, // 1 year
          includeSubDomains: true,
          preload: true,
        }
      : false,

    // ----- Cross-Origin policies -----
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },

    // ----- Anti-clickjacking + MIME-sniff -----
    referrerPolicy: { policy: "no-referrer" },
    frameguard: { action: "deny" },
    noSniff: true,
    hidePoweredBy: true,

    // ----- Legacy hardening -----
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    dnsPrefetchControl: { allow: false },
    ieNoOpen: true,
    originAgentCluster: true,
    xssFilter: true,

    // NOTE: `permissionsPolicy` Helmet 8 me built-in NAHI hai — niche
    // separate middleware se set kar rahe hain (security.ts)
  }),
);

// ============================================================================
// 2. Permissions-Policy — browser feature restrictions
// ============================================================================
// Camera, mic, geolocation, FLoC, etc. — sab block (security.ts me detail).
// XSS hone par bhi attacker sensitive APIs touch nahi kar paayega.
// ============================================================================
app.use(permissionsPolicy());

// ============================================================================
// 3. No-store cache headers
// ============================================================================
// Sensitive API responses (user data, sessions) shared cache/proxy me leak na
// ho. Specifically banks, healthcare, FAANG — sab no-store enforce karte hain
// authenticated endpoints pe.
// ============================================================================
app.use(noStoreCache());

// ============================================================================
// 4. Request ID — correlation tracking
// ============================================================================
// Har request unique ID — pino logs, Sentry breadcrumbs, response header
// (X-Request-Id) sab me consistent. Production debugging ka bread-and-butter.
// ============================================================================
app.use(requestId());

// ============================================================================
// 5. Response time tracking
// ============================================================================
// SLO/SLI monitoring ke liye — Datadog APM ya New Relic pick karega.
// ============================================================================
app.use(responseTime());

// ============================================================================
// 6. CORS
// ============================================================================
// Frontend (Next.js) ka origin .env me set — hardcode nahi.
// `credentials: true` Better Auth cookies cross-origin chalne ke liye must.
// `exposedHeaders` X-Request-Id ko frontend tak pahuncha de (debugging UX).
// ============================================================================
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposedHeaders: ["X-Request-Id", "Set-Cookie"],
    maxAge: 86400, // Preflight cache 24h — repeat OPTIONS calls bachao
  }),
);

// ============================================================================
// 7. Better Auth handler
// ============================================================================
// CRITICAL: JSON parser se PEHLE mount. Better-auth raw body khud parse karta.
// Express 5 syntax: `{*any}` named optional wildcard (path-to-regexp v8)
// Catches: /api/auth/sign-up/email, /api/auth/sign-in/social/google, etc.
// ============================================================================
app.all("/api/auth/{*any}", toNodeHandler(auth));

// ============================================================================
// 8. Body parsers
// ============================================================================
// Auth ke BAAD mount — JSON + urlencoded (forms).
// 1mb limit — DoS via huge payloads block. Adjust per route if needed.
// ============================================================================
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ============================================================================
// 9. Request logging
// ============================================================================
// Morgan → Pino. Dev me "dev" (colored short), prod me "combined" (Apache-style).
// req.id (security.ts se) Sentry breadcrumbs me bhi attach hoga.
// ============================================================================
app.use(
  morgan(isDev ? "dev" : "combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }),
);

// ============================================================================
// 10. Routes
// ============================================================================
const apiBase = `/${env.API_PREFIX}/${env.API_VERSION}`;

// Health check — load balancer / K8s liveness/readiness probe
// NOTE: ye no-store middleware ke baad bhi safe hai (LB cache nahi chahiye)
app.get(`${apiBase}/health`, (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// Welcome route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "LMS API",
    requestId: req.id,
  });
});

// Auth-related custom routes — /api/v1/auth/me etc.
// (Better Auth ke /api/auth/* se alag — woh server.ts me mounted hai)
app.use(`${apiBase}/auth`, authRoutes);

// Courses — public listing/detail + instructor/admin CRUD + nested modules/FAQs
app.use(`${apiBase}/courses`, courseRoutes);

// Uploads — R2 presigned URL endpoint (TipTap images, demo videos, covers)
app.use(`${apiBase}/uploads`, uploadRoutes);

// ============================================================================
// 11. 404 handler — saare routes ke baad
// ============================================================================
app.use(notFoundHandler);

// ============================================================================
// 12. Error handler — SABSE LAST (Express 4-arg signature rule)
// ============================================================================
app.use(errorHandler);

export default app;
