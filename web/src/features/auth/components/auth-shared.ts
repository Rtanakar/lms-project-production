// ============================================================================
// auth-shared.ts — Shared class names + motion variants for all auth forms
// ============================================================================
// Compact, minimal — fits 1080p without scroll. Brand: dark + orange accent.
// ============================================================================

import { cn } from "@/lib/utils";

// ─── Stagger animation ─────
export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.06 },
  },
};

export const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 26 },
  },
};

// ─── Input — dark + orange focus ─────
export const inputCx = cn(
  "h-11 border-[rgba(255,90,31,0.18)] bg-[rgba(15,10,7,0.55)] text-white",
  "placeholder:text-white/25",
  "focus:border-[#FF5A1F] focus:ring-2 focus:ring-[#FF5A1F]/25",
  "transition-all duration-200",
);

// ─── Glass card — tighter padding ─────
export const cardCx = cn(
  "relative rounded-2xl border border-[rgba(255,90,31,0.15)] bg-[rgba(20,12,8,0.5)]",
  "p-6 shadow-[0_20px_60px_-20px_rgba(224,74,18,0.3)] backdrop-blur-xl",
);

// ─── Primary CTA — orange gradient ─────
export const primaryBtnCx = cn(
  "h-11 w-full rounded-xl font-semibold text-white",
  "shadow-lg shadow-[rgba(224,74,18,0.35)] hover:shadow-[rgba(224,74,18,0.55)]",
  "transition-all duration-200 hover:-translate-y-0.5",
  "disabled:opacity-60 disabled:hover:translate-y-0",
);

export const primaryBtnStyle = {
  background: "linear-gradient(135deg,#FF5A1F,#E04A12)",
} as const;

// ─── Ghost / outlined ─────
export const ghostBtnCx = cn(
  "h-11 w-full border-[rgba(255,90,31,0.25)] bg-[rgba(255,90,31,0.06)]",
  "text-white/80 hover:bg-[rgba(255,90,31,0.14)]",
  "hover:border-[rgba(255,90,31,0.5)] hover:text-white",
  "transition-all duration-200",
);

// ─── Social OAuth icon button (side-by-side) ─────
export const socialBtnCx = cn(
  "h-11 w-full border-[rgba(255,90,31,0.18)] bg-[rgba(15,10,7,0.55)]",
  "text-white/85 hover:bg-[rgba(255,90,31,0.08)]",
  "hover:border-[rgba(255,90,31,0.4)]",
  "transition-all duration-200",
);

// ─── Gradient heading ─────
export const gradientHeading = {
  background: "linear-gradient(135deg, #fff 0%, #FFF7EC 50%, #FFB07A 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
} as const;
