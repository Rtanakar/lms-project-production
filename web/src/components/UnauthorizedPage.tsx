// ============================================================================
// UnauthorizedPage.tsx — Server-rendered 401 view
// ============================================================================
// Dashboard layout me jab session nahi mila to ye render hota.
// Sign-in pe redirect bhi kar sakte hain, but explicit page UX better hai —
// user ko pata chalta kya hua + return URL preserve hota.
// ============================================================================

import Link from "next/link";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0807] px-6">
      <div className="w-full max-w-md rounded-2xl border border-[rgba(255,90,31,0.15)] bg-[rgba(20,12,8,0.5)] p-8 text-center backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(255,90,31,0.3)] bg-[rgba(255,90,31,0.12)] shadow-[0_0_24px_rgba(224,74,18,0.3)]">
          <Lock className="size-6 text-[#FFB07A]" />
        </div>

        <h1
          className="text-2xl font-bold tracking-tight"
          style={{
            background:
              "linear-gradient(135deg, #fff 0%, #FFF7EC 60%, #FFB07A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Authentication required
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Please sign in to access the dashboard.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/sign-in?redirect=/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl font-semibold text-white shadow-lg shadow-[rgba(224,74,18,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[rgba(224,74,18,0.55)]"
            style={{
              background: "linear-gradient(135deg,#FF5A1F,#E04A12)",
            }}
          >
            Sign in
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[rgba(255,90,31,0.25)] bg-[rgba(255,90,31,0.06)] text-sm text-white/80 transition-colors hover:bg-[rgba(255,90,31,0.14)]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
