// ============================================================================
// sentry.ts — Sentry error tracking init
// ============================================================================
// IMPORTANT: Ye file server.ts me SABSE PEHLE import honi chahiye, baaki kisi
// bhi import se pehle. Kyunki Sentry instrumentation modules ko patch karta
// hai (express, http, prisma) jab wo load hote hain. Late init = missed errors.
//
// Industry me Sentry kyun?
//   - Production me errors ka real-time alert (Slack/email)
//   - Stack trace + breadcrumbs + user context
//   - Performance tracing (slow API endpoints)
//   - Source maps support (minified code ka original trace)
// ============================================================================

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { env, isProd } from "../config/env.js";

// Sirf tab init karo jab DSN provided ho (dev me optional hai)
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,

    // Performance monitoring — kitne % requests trace karne hain
    // Prod me 10% (cost control), dev me 100%
    tracesSampleRate: isProd ? 0.1 : 1.0,

    // Profiling — CPU/memory bottleneck detect karega
    profilesSampleRate: isProd ? 0.1 : 1.0,

    integrations: [
      nodeProfilingIntegration(),
      // Express, HTTP, Postgres auto-instrumented hote hain by default
    ],
  });
}

export { Sentry };
