// ============================================================================
// send-password-reset.ts — Password reset email sender
// ============================================================================

import { createElement } from "react";
import { sendEmail } from "./send-email.js";
import { PasswordResetEmail } from "../components/PasswordResetEmail.js";

export async function sendPasswordResetEmail({
  user,
  url,
}: {
  user: { name: string; email: string };
  url: string;
}): Promise<void> {
  await sendEmail({
    to: user.email,
    subject: "Reset your LMS password 🔑",
    react: createElement(PasswordResetEmail, { user, url }),
  });
}
