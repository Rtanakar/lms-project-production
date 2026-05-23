// ============================================================================
// (marketing)/layout.tsx — shared shell for public storefront routes
// ============================================================================
// `()` route group → doesn't affect the URL path. `/courses` and
// `/my-courses` both render under this layout — Lenis smooth scroll wraps
// the entire tree, fixed SiteHeader hides on scroll-down, content fills
// below.
//
// Home (`app/page.tsx`) and dashboard live outside this group so they keep
// their own chrome + native scroll (admin tables don't play with Lenis).
// ============================================================================

import { LenisProvider } from "@/components/motion/lenis-provider";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <div className="min-h-screen bg-[#0A0807] text-white">
        <SiteHeader />
        <main>{children}</main>
      </div>
    </LenisProvider>
  );
}
