// ============================================================================
// send-email.ts — Base Resend sender (used by all template-specific senders)
// ============================================================================
// Industry pattern: ek hi low-level sender, sab templates iske through bhejte
// hain. Benefits:
//   - Single point for retries, logging, error handling
//   - From-address, attachments, CC/BCC ek hi jagah configure
//   - Dev fallback (no API key → console log) ek hi jagah
// ============================================================================

import { Resend } from "resend";
import type { ReactElement } from "react";
import { env, isDev } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

// Singleton — sirf tab init karo jab API key ho
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface EmailAttachment {
  filename: string;
  /** Buffer (server) or base64 string — Resend accepts both */
  content: Buffer | string;
  contentType?: string;
}

export interface SendEmailProps {
  to: string;
  subject: string;
  /** React Email template (JSX) — Resend renders to HTML server-side */
  react: ReactElement;
  /** Optional CC */
  cc?: string | string[];
  /** Optional reply-to override */
  replyTo?: string | string[];
  /** Optional file attachments (PDFs, certificates) */
  attachments?: EmailAttachment[];
}

export async function sendEmail({
  to,
  subject,
  react,
  cc,
  replyTo,
  attachments,
}: SendEmailProps): Promise<void> {
  // Dev fallback — Resend setup nahi to skip kar do
  if (!resend) {
    if (isDev) {
      logger.warn(
        { to, subject },
        "RESEND_API_KEY not set — email skipped (dev mode)",
      );
      return;
    }
    throw new Error("RESEND_API_KEY is required in production");
  }

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject,
    react,
    ...(cc ? { cc } : {}),
    ...(replyTo ? { replyTo } : {}),
    ...(attachments?.length ? { attachments } : {}),
  });

  if (error) {
    logger.error({ error, to, subject }, "Failed to send email");
    throw new Error(`[Resend] ${error.message}`);
  }

  logger.info({ to, subject }, "Email sent");
}
