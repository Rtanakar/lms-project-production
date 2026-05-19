// ============================================================================
// /auth/verify-email — server component (Next.js 16)
// ============================================================================
// searchParams ASYNC in Next.js 16 — must await before destructuring.
// ============================================================================

import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailClient from "@/features/auth/components/VerifyEmailClient";

export const metadata: Metadata = {
  title: "Verify Email",
};

interface PageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  // Next.js 16: searchParams is a Promise
  const { email = "" } = await searchParams;

  return (
    <Suspense>
      <VerifyEmailClient email={email} />
    </Suspense>
  );
}
