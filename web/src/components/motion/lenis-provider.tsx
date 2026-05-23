// ============================================================================
// LenisProvider — buttery smooth-scroll for marketing routes
// ============================================================================
// Wraps just the (marketing) layout — dashboard pages keep native scroll
// because admin tables + sticky toolbars don't play nicely with inertial
// scrolling. designbybrandin / Studio Freight pattern.
//
// `lerp: 0.1` + `duration: 1.4` is the sweet spot — slower feels laggy,
// faster fights the user's input.
//
// `syncTouch: false` — on touch devices we let the browser handle scrolling
// natively. Lenis on mobile feels heavy and breaks pull-to-refresh.
// ============================================================================

"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

export function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.4,
        smoothWheel: true,
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
