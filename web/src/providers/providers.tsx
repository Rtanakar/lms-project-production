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
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <NuqsAdapter>
          <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        </NuqsAdapter>
      </QueryProvider>
    </ThemeProvider>
  );
}
