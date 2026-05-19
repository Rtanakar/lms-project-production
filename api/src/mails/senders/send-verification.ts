// ============================================================================
// send-verification.ts — Email verification sender
// ============================================================================

import { createElement } from "react";
import { sendEmail } from "./send-email.js";
import { VerificationEmail } from "../components/VerificationEmail.js";

export interface EmailVerificationData {
  user: { name: string; email: string };
  url: string;
}

export async function sendVerificationEmail({
  user,
  url,
}: EmailVerificationData): Promise<void> {
  await sendEmail({
    to: user.email,
    subject: "Verify your LMS email ✉️",
    // createElement use karte hain (JSX nahi) — sender files .ts hain, .tsx nahi
    react: createElement(VerificationEmail, { user, url }),
  });
}
