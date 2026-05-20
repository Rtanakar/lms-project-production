// ============================================================================
// TopNav.tsx — Marketing pages top navigation (home, /courses, etc.)
// ============================================================================
// Sheryians-style: brand left, links center pill nav, sign-in/avatar right.
// Auth pages me ye nav NAHI dikhta — (auth) layout apna independent shell hai.
//
// useSession() se logged-in detect — avatar dikhao, warna "Sign In" link.
// ============================================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Bootcamp", href: "/bootcamp" },
  { label: "Classroom", href: "/classroom" },
];

export default function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className="sticky top-0 z-50 w-full backdrop-blur-xl"
      style={{
        background: "rgba(10, 8, 7, 0.7)",
        borderBottom: "1px solid rgba(255,90,31,0.08)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* ─── Brand ─── */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg shadow-[rgba(224,74,18,0.4)]"
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
              className="block text-sm font-bold tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #fff 0%, #FFF7EC 60%, #FFB07A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              LMS
            </span>
            <span className="hidden text-[9px] font-semibold uppercase tracking-[2px] text-[#FF5A1F] sm:block">
              Learn · Build · Grow
            </span>
          </div>
        </Link>

        {/* ─── Pill nav (center, desktop only) ─── */}
        <nav className="hidden items-center gap-1 rounded-full border border-[rgba(255,90,31,0.12)] bg-[rgba(20,12,8,0.5)] p-1.5 backdrop-blur md:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-white shadow-[inset_0_0_0_1px_rgba(255,90,31,0.25)]"
                    : "text-white/65 hover:text-white",
                )}
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(255,90,31,0.15), rgba(224,74,18,0.05))",
                      }
                    : undefined
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ─── Right side ─── */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-full border border-[rgba(255,90,31,0.18)] bg-[rgba(20,12,8,0.55)] py-1.5 pl-1.5 pr-3 text-sm text-white/85 transition-all hover:border-[rgba(255,90,31,0.4)] hover:bg-[rgba(255,90,31,0.08)]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-[#FF5A1F] to-[#E04A12] text-xs font-bold uppercase">
                {session.user.name?.charAt(0) ?? "U"}
              </span>
              <span className="hidden sm:inline">
                {session.user.name?.split(" ")[0] ?? "Account"}
              </span>
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="text-sm font-medium text-white/85 transition-colors hover:text-[#FFB07A]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
