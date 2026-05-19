// ============================================================================
// layout.tsx — Root layout (server component)
// ============================================================================
// Next.js 16 me root layout server component rehta hai. Client-only cheezein
// (providers) ko alag client component me wrap karte hain.
//
// Fonts: Inter (sans). Geist Mono optional for code blocks.
// suppressHydrationWarning <html> pe — next-themes hydration mismatch fix.
// ============================================================================

import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LMS — Learn. Build. Grow.",
    template: "%s · LMS",
  },
  description:
    "Modern learning platform with courses, certificates, and live progress tracking.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(inter.variable, geistMono.variable)}
    >
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
