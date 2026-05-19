// ============================================================================
// send-delete-account.ts — Account deletion confirmation email sender
// ============================================================================

import { createElement } from "react";
import { sendEmail } from "./send-email.js";
import { DeleteAccountEmail } from "../components/DeleteAccountEmail.js";

export async function sendDeleteAccountVerificationEmail({
  user,
  url,
}: {
  user: { name: string; email: string };
  url: string;
}): Promise<void> {
  await sendEmail({
    to: user.email,
    subject: "Confirm account deletion — LMS ⚠️",
    react: createElement(DeleteAccountEmail, { user, url }),
  });
}
