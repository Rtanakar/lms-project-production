// ============================================================================
// providers.tsx — Root provider composition
// ============================================================================
// Sab providers ko yaha compose karte hain — root layout me ek hi <Providers>
// import. Order matters:
//   1. ThemeProvider (outermost) — theme class root html pe set
//   2. QueryProvider — sab queries iske andar
//   3. Toaster (sonner) — toast notifications, sab pages me available
// ============================================================================

"use client";

import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { Toaster } from "@/components/ui/sonner";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        {/* Branded toaster — orange brand + cream surface, mirrors emailTheme */}
        <Toaster
          position="bottom-right"
          closeButton
          duration={4500}
          toastOptions={{
            unstyled: false,
            classNames: {
              toast:
                "!bg-[#181312] !border !border-[#FF5A1F]/25 !text-[#FFF7EC] !shadow-[0_8px_32px_rgba(0,0,0,0.45)] !rounded-xl",
              title: "!text-[#FFF7EC] !font-semibold",
              description: "!text-[#FFF7EC]/70",
              actionButton: "!bg-[#FF5A1F] !text-[#0E0A07]",
              cancelButton: "!bg-[#FFF7EC]/10 !text-[#FFF7EC]",
              closeButton:
                "!bg-[#181312] !border !border-[#FF5A1F]/30 !text-[#FFF7EC]",
              success: "!border-[#1F7A3A]/40",
              error: "!border-[#B3321B]/50",
            },
            style: {
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </QueryProvider>
    </ThemeProvider>
  );
}
