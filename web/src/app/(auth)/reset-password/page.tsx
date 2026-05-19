// ============================================================================
// /auth/reset-password — server component (Next.js 16)
// ============================================================================
// NOTE: requireUnauth() NAHI yaha — reset link clicker already signed-in
// ho sakta hai (admin triggers reset from Settings). Form khud handle karega.
// ============================================================================

import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  // useSearchParams() in form → Suspense boundary required
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
