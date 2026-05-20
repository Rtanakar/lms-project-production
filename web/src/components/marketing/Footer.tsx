// ============================================================================
// Footer.tsx — Marketing footer with cursor-reveal wordmark
// ============================================================================
// Sheryians-signature effect: huge outlined brand wordmark — fills with orange
// gradient only NEAR the cursor (radial mask follows mouse). Below: columns
// for About, Company, Contact + social icons.
//
// Technique:
//   - 2 stacked <span>s with same text
//   - Layer 1: -webkit-text-stroke (outline only, transparent fill)
//   - Layer 2: linear-gradient bg-clip text + radial mask at cursor pos
//   - onMouseMove updates --mx / --my CSS variables on container
//   - mask-image: radial-gradient(circle at var(--mx) var(--my), ...)
// ============================================================================

"use client";

import { Apple, Edit, Video } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

const ABOUT_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Support", href: "/support" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Pricing & Refund", href: "/pricing" },
  { label: "Terms & Conditions", href: "/terms" },
];

const COMPANY_LINKS = [
  { label: "Hire From Us", href: "/hire" },
  { label: "Discord", href: "https://discord.gg" },
  { label: "Jobs", href: "/jobs" },
  { label: "Submit Projects", href: "/projects/submit" },
  { label: "Feedback", href: "/feedback" },
];

export default function Footer() {
  const wordmarkRef = useRef<HTMLDivElement>(null);

  // Cursor tracking — update CSS variables directly (no re-renders, smooth 60fps)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wordmarkRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  // Reset to center when mouse leaves — gradient subtly visible at center
  const handleMouseLeave = () => {
    const el = wordmarkRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${rect.width / 2}px`);
    el.style.setProperty("--my", `${rect.height / 2}px`);
  };

  return (
    <footer className="relative overflow-hidden border-t border-[rgba(255,90,31,0.08)] bg-[#0A0807]">
      {/* ─── Giant outlined wordmark with cursor-reveal ─── */}
      <div
        ref={wordmarkRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative cursor-default px-6 pt-24"
        style={
          {
            "--mx": "50%",
            "--my": "50%",
          } as React.CSSProperties
        }
      >
        <div className="relative mx-auto max-w-7xl select-none">
          {/* Layer 1: outline only (always visible, subtle) */}
          <span
            aria-hidden
            className="block text-center font-black leading-[0.85] tracking-tight"
            style={{
              fontSize: "clamp(80px, 22vw, 280px)",
              WebkitTextStroke: "1px rgba(255,255,255,0.12)",
              color: "transparent",
            }}
          >
            LMS
          </span>

          {/* Layer 2: gradient fill, masked to cursor */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 block text-center font-black leading-[0.85] tracking-tight"
            style={{
              fontSize: "clamp(80px, 22vw, 280px)",
              background:
                "linear-gradient(135deg, #FF5A1F 0%, #E04A12 50%, #FFB07A 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              // The mask reveals the gradient ONLY in a circle around cursor
              maskImage:
                "radial-gradient(420px circle at var(--mx) var(--my), black 0%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(420px circle at var(--mx) var(--my), black 0%, transparent 75%)",
              transition: "mask-image 80ms linear",
            }}
          >
            LMS
          </span>

          {/* Tagline below wordmark */}
          <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[6px] text-[#FF5A1F]/70">
            Learn · Build · Grow
          </p>
        </div>
      </div>

      {/* ─── Columns: logo + social | About | Company | Contact ─── */}
      <div className="relative mx-auto mt-20 max-w-7xl px-6 pb-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: logo + socials */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-[rgba(224,74,18,0.4)]"
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
              <span
                className="text-lg font-bold tracking-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #fff 0%, #FFF7EC 60%, #FFB07A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                LMS
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-white/45">
              Modern learning platform built for ambitious developers. Master
              skills at your own pace.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              <SocialIcon href="https://instagram.com" label="Instagram">
                <Apple className="size-4" />
              </SocialIcon>
              <SocialIcon href="https://linkedin.com" label="LinkedIn">
                <Edit className="size-4" />
              </SocialIcon>
              <SocialIcon href="https://discord.gg" label="Discord">
                <DiscordIcon />
              </SocialIcon>
              <SocialIcon href="https://youtube.com" label="YouTube">
                <Video className="size-4" />
              </SocialIcon>
              <SocialIcon href="https://x.com" label="X">
                <XIcon />
              </SocialIcon>
            </div>
          </div>

          {/* Column 2: About */}
          <FooterColumn title="About" links={ABOUT_LINKS} />

          {/* Column 3: Company */}
          <FooterColumn title="Company" links={COMPANY_LINKS} />

          {/* Column 4: Contact */}
          <div className="space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/85">
              Contact
            </h3>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#FF5A1F]">
                Online: 11am – 8pm
              </p>
              <a
                href="tel:+919993478545"
                className="text-sm text-white/75 transition-colors hover:text-[#FFB07A]"
              >
                +91 99934 78545
              </a>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#FF5A1F]">
                Offline: 11am – 8pm
              </p>
              <a
                href="tel:+919691778470"
                className="text-sm text-white/75 transition-colors hover:text-[#FFB07A]"
              >
                +91 96917 78470
              </a>
            </div>

            <a
              href="mailto:hello@lms.com"
              className="block text-sm text-white/75 transition-colors hover:text-[#FFB07A]"
            >
              hello@lms.com
            </a>

            <address className="not-italic text-sm leading-relaxed text-white/55">
              23-B, Sector C
              <br />
              Indrapuri,
              <br />
              Bhopal (MP), 462023
            </address>
          </div>
        </div>

        {/* ─── Bottom strip ─── */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[rgba(255,90,31,0.08)] pt-8 sm:flex-row">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} LMS. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Crafted with care for serious learners.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Reusable footer column ─────
function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-white/85">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1.5 text-sm text-white/55 transition-all hover:text-[#FFB07A]"
            >
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                {link.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Reusable social icon button ─────
function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-lg border border-[rgba(255,90,31,0.15)] bg-[rgba(20,12,8,0.5)] text-white/65 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,90,31,0.45)] hover:bg-[rgba(255,90,31,0.08)] hover:text-[#FFB07A] hover:shadow-[0_4px_12px_-2px_rgba(224,74,18,0.4)]"
    >
      {children}
    </a>
  );
}

// ─── Custom Discord icon (lucide me nahi hai) ─────
function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05 0 .07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
    </svg>
  );
}

// ─── Custom X (Twitter) icon ─────
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
