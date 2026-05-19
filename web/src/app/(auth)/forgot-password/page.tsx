// ============================================================================
// /auth/forgot-password — server component
// ============================================================================

import type { Metadata } from "next";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import { requireUnauth } from "@/lib/helpers/auth-helpers";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default async function ForgotPasswordPage() {
  await requireUnauth();

  return <ForgotPasswordForm />;
}
