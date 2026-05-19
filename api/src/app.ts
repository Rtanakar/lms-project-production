// ============================================================================
// app.ts — Express app configuration (middleware chain + routes)
// ============================================================================
// Middleware ORDER bahut matter karta hai Express me. Standard production order:
//   1. Security headers (helmet) — sabse pehle, har response pe lagne chahiye
//   2. CORS — browser ke preflight ke liye early needed
//   3. Better Auth handler — JSON parser se PEHLE mount karna ZAROORI hai
//      (better-auth raw body khud parse karta hai; agar JSON middleware pehle
//       lage to better-auth tut jaata hai)
//   4. Body parsers (json/urlencoded) — better-auth ke BAAD, baaki routes ke liye
//   5. Request logger (morgan) — har request log ho
//   6. Routes
//   7. 404 handler
//   8. Error handler (sabse aakhir me — Express ka rule)
// ============================================================================

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env, isDev } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import authRoutes from "./routes/auth.routes.js";

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

// ===== 3. Better Auth handler =====
// CRITICAL: Ye JSON parser se PEHLE mount hona chahiye.
// Kyon? better-auth raw request body ko apne tarike se parse karta hai.
// Agar express.json() pehle lage to body already consume ho jaati hai
// aur better-auth ko empty/broken body milti hai.
//
// Express 5 syntax: `*splat` = named wildcard for path-to-regexp v8
// Catches: /api/auth/sign-up/email, /api/auth/sign-in/social/google, etc.
//
// NOTE: server.ts me ab ye line nahi chahiye — yahan se handle ho raha hai.
app.all("/api/auth/*splat", toNodeHandler(auth));

// ===== 4. Body parsers =====
// better-auth ke BAAD mount karo — baaki saare routes ke liye kaam karega.
// JSON: REST API requests ke liye
// urlencoded: HTML form submissions ke liye (agar kabhi chahiye)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ===== 5. Request logging =====
// Morgan ka output Pino me pipe kar dete hain — single log stream
// "dev" format colored aur short, prod me "combined" (Apache-style detailed)
app.use(
  morgan(isDev ? "dev" : "combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }),
);

// ===== 6. Routes =====
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

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Welcome to dashboard");
});

// Auth-related custom routes (/me, /update-profile, /change-password etc.)
// Ye /api/v1/auth/* handle karta hai — better-auth ke /api/auth/* se alag hai
app.use(`${apiBase}/auth`, authRoutes);

// TODO: Future feature routes:
// app.use(`${apiBase}/users`, userRoutes);
// app.use(`${apiBase}/courses`, courseRoutes);

// ===== 7. 404 handler =====
// Saare routes ke BAAD — koi match nahi hua to ye chalega
app.use(notFoundHandler);

// ===== 8. Error handler =====
// SABSE LAST — Express ka rule (4-arg signature pehchanta hai)
app.use(errorHandler);

export default app;
