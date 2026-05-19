// ============================================================================
// auth.ts — Better Auth production configuration
// ============================================================================
// Production-grade features enabled:
//   1. Prisma adapter (persistent Postgres storage)
//   2. Upstash Redis secondary storage (session cache + distributed rate-limit)
//   3. Email/Password with email verification flow
//   4. OAuth (Google + GitHub)
//   5. Password reset, account deletion flows
//   6. Welcome email on first signup
//   7. Trusted origins (CSRF protection)
//   8. Rate limiting (100 req/min/IP, Redis-backed in prod)
//   9. Auto admin role assignment via ADMIN_EMAILS env
// ============================================================================

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db/db.js";
import { env, isProd } from "../config/env.js";
import { upstash } from "./redis.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendDeleteAccountVerificationEmail,
} from "../mails/index.js";
import { logger } from "../utils/logger.js";

// Admin emails parse — comma separated env se
const adminEmails = env.ADMIN_EMAILS.split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// ===== Secondary storage (Upstash Redis) =====
// PRODUCTION CRITICAL: session lookups, rate-limit counters, verification
// tokens — sab Redis me cache hote hain. DB hit reduce hota hai 90%+.
// Multi-instance deployment me ye MUST hai (warna rate limit per-instance
// hoga, not global → attackers bypass kar sakte hain).
//
// IIFE pattern use kar rahe hain TS narrowing ke liye — arrow functions ke
// andar `upstash` ko closure me narrow rakhna padta hai (local const me copy).
const secondaryStorage = upstash
  ? (() => {
      const client = upstash; // non-null local ref — TS closure-safe
      return {
        get: async (key: string) => {
          const value = await client.get<string>(key);
          return value ?? null;
        },
        set: async (key: string, value: string, ttl?: number) => {
          if (ttl) await client.set(key, value, { ex: ttl });
          else await client.set(key, value);
        },
        delete: async (key: string) => {
          await client.del(key);
        },
      };
    })()
  : undefined;

export const auth = betterAuth({
  // ===== Database =====
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  // ===== Secondary storage =====
  // undefined hone par better-auth in-memory fallback use karega (dev safe)
  secondaryStorage,

  // ===== App identity =====
  appName: "LMS",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.CORS_ORIGIN, env.BETTER_AUTH_URL],

  // ===== Session config =====
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh token every 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 min cookie cache — DB load down
    },
  },

  // ===== Cookie security =====
  advanced: {
    useSecureCookies: isProd,
    defaultCookieAttributes: {
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      httpOnly: true,
    },
  },

  // ===== Email & Password =====
  // INDUSTRY FLOW (modern SaaS — soft verify):
  //   1. User signup → user create hota hai (emailVerified=false)
  //   2. autoSignIn: true → session immediately ban jata hai, user app me ghus jaata hai
  //   3. Background me verification email bhejte hain (sendOnSignUp)
  //   4. User app use kar sakta hai but UI me "Verify your email" banner dikhega
  //   5. Sensitive actions (payment, public posting) emailVerified=true pe gate
  //
  // Ye pattern Vercel, Linear, GitHub, Netflix, Notion — sab use karte hain.
  // Reason: faster onboarding = higher conversion. Strict verify-first wahi use
  // karte hain jaha email pakka chahiye (banking, .edu).
  emailAndPassword: {
    enabled: true,
    // Verify hue bina bhi sign-in allowed (soft verify pattern)
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Signup ke turant baad session bana do — modern UX
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      // Password reset link bhejne se pehle callbackURL ensure karo
      // (verify ke baad /login pe redirect hoga, success message ke saath)
      const resetUrl = new URL(url);
      if (!resetUrl.searchParams.has("callbackURL")) {
        resetUrl.searchParams.set(
          "callbackURL",
          `${env.CORS_ORIGIN}/login?reset=success`,
        );
      }
      await sendPasswordResetEmail({ user, url: resetUrl.toString() });
    },
  },

  // ===== Email verification =====
  // Soft verify pattern — email background me bhejte hain, but block nahi karte
  emailVerification: {
    // Signup ke baad verification email auto-send
    sendOnSignUp: true,
    // Verify hone ke baad bhi auto-signin (already signed-in hai but token rotate)
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Verify ke baad frontend me dashboard pe redirect (already logged-in)
      const verifyUrl = new URL(url);
      if (!verifyUrl.searchParams.has("callbackURL")) {
        verifyUrl.searchParams.set(
          "callbackURL",
          `${env.CORS_ORIGIN}/dashboard?verified=true`,
        );
      }
      await sendVerificationEmail({ user, url: verifyUrl.toString() });
    },
  },

  // ===== OAuth providers (conditional) =====
  socialProviders: {
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  // ===== User customization =====
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "STUDENT",
        input: false, // user signup me role choose nahi kar sakta (security)
      },
    },

    // ===== Account deletion flow =====
    // Better Auth built-in delete flow: API → send confirmation email →
    // user clicks link → account erased (with all related data via Prisma
    // onDelete: Cascade)
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerificationEmail({ user, url });
      },
    },
  },

  // ===== Lifecycle hooks =====
  databaseHooks: {
    user: {
      create: {
        // BEFORE create — auto-assign ADMIN role if email is in ADMIN_EMAILS
        before: async (user) => {
          const isAdmin = adminEmails.includes(user.email.toLowerCase());
          return {
            data: { ...user, role: isAdmin ? "ADMIN" : "STUDENT" },
          };
        },
        // AFTER create — send welcome email (fire-and-forget, don't block signup)
        after: async (user) => {
          try {
            await sendWelcomeEmail({ name: user.name, email: user.email });
          } catch (err) {
            // Email fail hone se signup fail nahi karna — bas log karo
            logger.error({ err, userId: user.id }, "Welcome email failed");
          }
        },
      },
    },
  },

  // ===== Rate limiting =====
  // Redis-backed (via secondaryStorage above) → distributed across instances
  rateLimit: {
    enabled: true,
    window: 60, // 60-second sliding window
    max: 100, // 100 requests/min/IP
    storage: upstash ? "secondary-storage" : "memory",
  },
});

// Type exports — middleware aur controllers use karenge
export type Session = typeof auth.$Infer.Session.session;
export type AuthUser = typeof auth.$Infer.Session.user;
