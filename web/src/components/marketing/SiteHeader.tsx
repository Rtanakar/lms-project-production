// ============================================================================
// SiteHeader.tsx — Marketing header (scroll-hide, glass chip, overlay menu)
// ============================================================================
// designbybrandin / Awwwards pattern:
//   • Fixed glassy bar — hides on scroll-down, reveals on scroll-up
//   • Brand left · "Connect" CTA center (md+) · cart + UserMenu + Menu right
//   • "Menu" button opens a full-screen overlay (NavOverlay) with big
//     animated link stack and a meta column (contact, location, socials)
//
// Decisions:
//   • Scroll thresholds (80px reveal-zone, 8px delta) cancel Lenis inertia
//     jitter so the bar doesn't pop in/out every frame
//   • `useUIStore.menuOpen` lifted to Zustand so the cart / overlay close
//     button / Escape key can all flip it without prop drilling
//   • Body overflow locked while overlay is open — Lenis pauses cleanly
//     against `overflow:hidden`
// ============================================================================

"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { Magnetic } from "@/components/motion/magnetic";
import { AnimatedMenuLink } from "@/components/motion/animated-menu-link";
import { CartButton } from "@/features/cart/components/CartButton";
import { UserMenu } from "./UserMenu";

const EASE = [0.22, 1, 0.36, 1] as const;
const OVERLAY_EASE = [0.76, 0, 0.24, 1] as const;

// ─── Nav config — single source of truth for header + overlay ──────────────
const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "My Courses", href: "/my-courses" },
  { label: "Bootcamp", href: "/bootcamp" },
];

const SOCIALS = [
  { label: "GitHub", href: "https://github.com" },
  { label: "Twitter", href: "https://twitter.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

// ============================================================================
// SiteHeader
// ============================================================================
export function SiteHeader() {
  const open = useUIStore((s) => s.menuOpen);
  const setOpen = useUIStore((s) => s.setMenuOpen);

  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ─── Scroll-hide logic ────────────────────────────────────────────────
  // Reads scrollY via motion-value subscription (no React re-render per
  // frame). We flip two booleans (hidden, scrolled) with hysteresis so
  // the bar doesn't ping-pong on minor scroll wobble.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    const delta = latest - prev;

    setScrolled(latest > 12);

    // Near-top safe zone — always reveal so first paint never hides.
    if (latest < 80) {
      setHidden(false);
      return;
    }
    // Keep visible while overlay is open (close button must be reachable).
    if (open) {
      setHidden(false);
      return;
    }
    // 8px threshold absorbs Lenis interpolation + trackpad overshoot.
    if (delta > 8) setHidden(true);
    else if (delta < -8) setHidden(false);
  });

  // ─── Body scroll lock during overlay ───
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ─── Escape closes overlay ───
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -32, opacity: 0 }}
        animate={{
          y: hidden ? "-110%" : 0,
          opacity: 1,
        }}
        transition={{ duration: 0.45, ease: EASE }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          scrolled || open
            ? "border-b border-[rgba(255,90,31,0.08)] bg-[rgba(10,8,7,0.55)] backdrop-blur-xl backdrop-saturate-150"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-10">
          {/* ─── Brand ─── */}
          <Magnetic strength={0.25}>
            <Link
              href="/"
              aria-label="Home"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg shadow-[rgba(224,74,18,0.4)]"
                style={{ background: "linear-gradient(135deg,#FF5A1F,#E04A12)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
              <span
                className="text-sm font-bold tracking-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #fff 0%, #FFF7EC 60%, #FFB07A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                LMS<span className="text-[#FF5A1F]">.</span>
              </span>
            </Link>
          </Magnetic>

          {/* ─── Center CTA chip (md+) ─── */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            <Magnetic strength={0.2} hoverScale={1.04}>
              <Link
                href="/courses"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,90,31,0.18)] bg-[rgba(20,12,8,0.55)] px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85 transition-colors hover:border-[rgba(255,90,31,0.45)] hover:text-white"
              >
                Browse Courses
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Magnetic>
          </div>

          {/* ─── Right cluster: cart + user + menu ─── */}
          <div className="flex items-center gap-2">
            <CartButton />
            <UserMenu />
            <Magnetic strength={0.25} hoverScale={1.05}>
              <button
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="site-nav-overlay"
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,90,31,0.18)] bg-[rgba(20,12,8,0.55)] px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85 transition-colors hover:border-[rgba(255,90,31,0.45)] hover:text-white"
              >
                <span className="hidden sm:inline">
                  {open ? "Close" : "Menu"}
                </span>
                <span className="relative inline-flex size-4 items-center justify-center">
                  <AnimatePresence initial={false} mode="wait">
                    {open ? (
                      <motion.span
                        key="x"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="absolute"
                      >
                        <X className="size-4" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="m"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="absolute"
                      >
                        <Menu className="size-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && <NavOverlay onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// NavOverlay — full-screen drawer (2-col on lg+)
// ============================================================================
function NavOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      id="site-nav-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.7, ease: OVERLAY_EASE }}
      className="fixed inset-0 z-40 flex min-h-dvh flex-col overflow-y-auto bg-[#0A0807]/95 backdrop-blur-xl"
    >
      {/* Orange wash — echoes hero gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(255,90,31,0.16),transparent_55%)]"
      />

      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-12 px-5 pt-24 pb-12 md:px-10 md:pt-28 lg:grid-cols-[1.4fr_1fr] lg:gap-16 lg:pt-32 lg:pb-16">
        {/* ─── Primary nav stack ─── */}
        <nav
          aria-label="Primary"
          className="flex flex-col gap-1 sm:gap-2 lg:gap-3"
        >
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-white/40"
          >
            ◍ Navigate
          </motion.span>

          {NAV_ITEMS.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{
                duration: 0.55,
                delay: 0.25 + i * 0.05,
                ease: EASE,
              }}
            >
              <AnimatedMenuLink
                href={item.href}
                label={item.label}
                onClick={onClose}
                className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[clamp(2.5rem,4.4vw,4.5rem)]"
              />
            </motion.div>
          ))}
        </nav>

        {/* ─── Meta column ─── */}
        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
          className="flex flex-col justify-between gap-10 border-t border-[rgba(255,90,31,0.1)] pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0"
        >
          <div className="flex flex-col gap-8">
            <MetaBlock label="Get in touch">
              <Link
                href="mailto:hello@lms.dev"
                onClick={onClose}
                className="group inline-flex items-center gap-2 text-xl font-medium text-white/95 transition-colors hover:text-[#FFB07A] md:text-2xl"
              >
                hello@lms.dev
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </MetaBlock>

            <MetaBlock label="Based in">
              <p className="text-lg text-white/85 md:text-xl">
                India · Available worldwide
              </p>
            </MetaBlock>

            <MetaBlock label="Currently">
              <p className="text-lg text-white/85 md:text-xl">
                Onboarding new students
                <span className="ml-2 inline-block size-2 -translate-y-0.5 animate-pulse rounded-full bg-[#FF5A1F] align-middle" />
              </p>
            </MetaBlock>
          </div>

          <div className="flex flex-col gap-4 border-t border-[rgba(255,90,31,0.1)] pt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
            <span>© {new Date().getFullYear()} LMS Production</span>
            <div className="flex gap-5">
              {SOCIALS.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors hover:text-[#FFB07A]"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}

function MetaBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-white/40">
        {label}
      </span>
      {children}
    </div>
  );
}
