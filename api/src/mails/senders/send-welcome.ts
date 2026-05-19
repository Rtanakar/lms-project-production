// ============================================================================
// send-welcome.ts — Welcome / onboarding email sender
// ============================================================================

import { createElement } from "react";
import { sendEmail } from "./send-email.js";
import { WelcomeEmail } from "../components/WelcomeEmail.js";

export async function sendWelcomeEmail(user: {
  name: string;
  email: string;
}): Promise<void> {
  await sendEmail({
    to: user.email,
    subject: "Welcome to LMS! 🎉",
    react: createElement(WelcomeEmail, { user }),
  });
}
