// ============================================================================
// (auth)/layout.tsx — Two-column auth shell (brand left, form right)
// ============================================================================
// Dark theme + orange accents matching the LMS brand. Subtle animated orbs
// + grid overlay give "modern SaaS" feel like Vercel / Linear / Sheryians.
//
// NOTE: requireUnauth() NAHI yaha — kyunki reset-password page already
// signed-in users ke liye bhi accessible hona chahiye (admin triggers reset
// from Settings → opens link → still signed in). Har page khud gate kare.
// ============================================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: `%s · LMS`,
    default: "Authentication · LMS",
  },
  description: "Sign in or create your LMS account",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0807] text-white">
      {/* ─── Scoped fonts + orb keyframes ─── */}
      <style>{`
        .auth-display { font-family: var(--font-sans); letter-spacing: -0.02em; }
        @keyframes authOrb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(55px,-38px) scale(1.05)} 66%{transform:translate(-28px,45px) scale(0.96)} }
        @keyframes authOrb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-44px,28px)} }
        @keyframes authOrb3 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(36px,-55px) scale(1.08)} 70%{transform:translate(-18px,28px) scale(0.92)} }
      `}</style>

      {/* ─── Ambient orange orbs ─── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-105 w-105 rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,90,31,0.32) 0%, rgba(224,74,18,0.10) 45%, transparent 70%)",
          animation: "authOrb1 20s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/3 h-120 w-120 rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,140,80,0.28) 0%, rgba(224,74,18,0.08) 50%, transparent 72%)",
          animation: "authOrb2 16s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/3 h-95 w-95 rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,176,122,0.20) 0%, rgba(224,74,18,0.06) 50%, transparent 72%)",
          animation: "authOrb3 24s ease-in-out infinite",
        }}
      />

      {/* ─── Subtle grid overlay (radial mask) ─── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,90,31,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,90,31,0.5) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, transparent 75%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen">
        {/* ─── Left: brand story (desktop only) ─── */}
        <div className="relative hidden lg:flex lg:w-1/2">
          <div className="flex w-full flex-col justify-between p-12">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-[rgba(224,74,18,0.45)]"
                style={{
                  background: "linear-gradient(135deg,#FF5A1F,#E04A12)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 10v6M2 10l10-5 10 5-10 5z"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 12v5c3 3 9 3 12 0v-5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="leading-tight">
                <span
                  className="auth-display block text-base font-bold tracking-tight"
                  style={{
                    background:
                      "linear-gradient(135deg, #fff 0%, #FFF7EC 60%, #FFB07A 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  LMS
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[3px] text-[#FF5A1F]">
                  Learn · Build · Grow
                </span>
              </div>
            </div>

            {/* Hero content */}
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,90,31,0.3)] bg-[rgba(255,90,31,0.12)] px-4 py-1.5 text-xs font-medium tracking-wide text-[#FFB07A]">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF5A1F] shadow-[0_0_6px_#FF5A1F]" />
                Trusted by serious learners
              </span>

              <h2 className="auth-display text-4xl font-bold leading-[1.1]">
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #fff 0%, #FFF7EC 60%, #FFB07A 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Master skills
                </span>
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg,#FF5A1F,#FFB07A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  at your own pace
                </span>
              </h2>

              <p className="max-w-sm text-sm leading-relaxed text-white/60">
                A modern learning platform built for ambitious developers.
                Courses, progress tracking, certificates — all in one place.
              </p>

              <ul className="space-y-3">
                {[
                  "Hundreds of structured courses",
                  "Real-time progress & streaks",
                  "Verified completion certificates",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-white/75"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-[rgba(255,90,31,0.35)] bg-[rgba(255,90,31,0.14)]">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FFB07A"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex gap-10 pt-2">
                {[
                  ["10K+", "Learners"],
                  ["500+", "Courses"],
                  ["4.9★", "Rating"],
                ].map(([val, label]) => (
                  <div key={label}>
                    <div
                      className="auth-display text-2xl font-bold"
                      style={{
                        background: "linear-gradient(135deg,#FF5A1F,#FFB07A)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {val}
                    </div>
                    <div className="text-[11px] uppercase tracking-widest text-white/40">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={
                    i === 0
                      ? "h-1.5 w-6 rounded-full bg-[#FF5A1F] shadow-[0_0_8px_#FF5A1F]"
                      : "h-1.5 w-1.5 rounded-full bg-[rgba(255,90,31,0.3)]"
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right: form slot ─── */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg,#FF5A1F,#E04A12)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 10v6M2 10l10-5 10 5-10 5z"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className="auth-display text-lg font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #fff 0%, #FFF7EC 60%, #FFB07A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                LMS
              </span>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
