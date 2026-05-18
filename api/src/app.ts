// ============================================================================
// app.ts — Express app configuration (middleware chain + routes)
// ============================================================================
// Middleware ORDER bahut matter karta hai Express me. Standard production order:
//   1. Security headers (helmet) — sabse pehle, har response pe lagne chahiye
//   2. CORS — browser ke preflight ke liye early needed
//   3. Body parsers (json/urlencoded) — routes se pehle, but auth handler ke BAAD
//      (better-auth ka apna body parsing hai, isliye server.ts me ye order maintain hai)
//   4. Request logger (pino-http / morgan) — har request log ho
//   5. Routes
//   6. 404 handler
//   7. Error handler (sabse aakhir me — Express ka rule)
// ============================================================================

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env, isDev } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";

const app = express();

// ===== 1. Security headers =====
// Helmet 14+ industry-standard security headers laga deta hai:
// Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, etc.
app.use(helmet());

// ===== 2. CORS =====
// Frontend (Next.js) ka origin .env me set — hardcode nahi karte
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true, // Cookies (better-auth session) bhejne ke liye zaruri
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

// ===== 3. Body parsers =====
// NOTE: server.ts me better-auth handler ke BAAD ye mounted hai (intentional).
// Yaha app.ts ke andar bhi rakhne se koi conflict nahi, but server.ts wali
// line authoritative hai. Yaha sirf urlencoded forms ke liye.
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ===== 4. Request logging =====
// Morgan ka output Pino me pipe kar dete hain — single log stream
// "dev" format colored aur short, prod me "combined" (Apache-style detailed)
app.use(
  morgan(isDev ? "dev" : "combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }),
);

// ===== 5. Routes =====
// API versioning: /api/v1/... — future-proof (v2 release kar sakte ho bina break kiye)
// http://localhost:8080/api/v1/health
const apiBase = `/${env.API_PREFIX}/${env.API_VERSION}`;

// Health check — load balancer / uptime monitor isko hit karta hai
app.get(`${apiBase}/health`, (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// TODO: Yaha feature routes mount honge jaise:
// app.use(`${apiBase}/users`, userRoutes);
// app.use(`${apiBase}/courses`, courseRoutes);

// ===== 6. 404 handler =====
// Saare routes ke BAAD — koi match nahi hua to ye chalega
app.use(notFoundHandler);

// ===== 7. Error handler =====
// SABSE LAST — Express ka rule (4-arg signature pehchanta hai)
app.use(errorHandler);

export default app;
