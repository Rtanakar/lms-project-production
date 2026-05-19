// ============================================================================
// /auth/sign-in — server component (Next.js 16)
// ============================================================================

import type { Metadata } from "next";
import SignInForm from "@/features/auth/components/SignInForm";
import { requireUnauth } from "@/lib/helpers/auth-helpers";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function SignInPage() {
  // Already logged-in users → /dashboard
  await requireUnauth();

  // Suspense — kyunki SignInForm useSearchParams() use karta hai
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
