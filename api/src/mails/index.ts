// ============================================================================
// mails/index.ts — Barrel export
// ============================================================================
// Single import point: import { sendVerificationEmail } from "../mails";
// Industry-friendly — clean import paths.
// ============================================================================

export { sendEmail } from "./senders/send-email.js";
export { sendVerificationEmail } from "./senders/send-verification.js";
export { sendPasswordResetEmail } from "./senders/send-password-reset.js";
export { sendWelcomeEmail } from "./senders/send-welcome.js";
export { sendDeleteAccountVerificationEmail } from "./senders/send-delete-account.js";
