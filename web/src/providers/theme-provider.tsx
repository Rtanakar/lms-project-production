// ============================================================================
// theme-provider.tsx — next-themes wrapper
// ============================================================================
// next-themes Server-side hydration mismatch handle karta hai by adding
// suppressHydrationWarning to <html>. Dark/light/system mode automatic.
//
// disableTransitionOnChange: theme toggle pe sab transitions ko ek frame ke
// liye disable karta hai — flicker bachata hai.
// ============================================================================

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
