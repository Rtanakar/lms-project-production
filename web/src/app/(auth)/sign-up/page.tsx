// ============================================================================
// /auth/sign-up — server component
// ============================================================================

import type { Metadata } from "next";
import SignUpForm from "@/features/auth/components/SignUpForm";
import { requireUnauth } from "@/lib/helpers/auth-helpers";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function SignUpPage() {
  await requireUnauth();

  return <SignUpForm />;
}
