// ============================================================================
// Magnetic — pointer-follow translate wrapper (Awwwards / designbybrandin)
// ============================================================================
// Element subtly pulls toward the cursor on hover (translate proportional to
// the cursor's offset from element center). On leave, snaps back via spring.
//
// Strength = max translate fraction of element half-width (0.25 ≈ 25%).
// `hoverScale` lets a button additionally scale on hover for the CTA feel
// (combined transforms still GPU-composite; no layout thrash).
// ============================================================================

"use client";

import { motion, useSpring, useReducedMotion } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";

interface MagneticProps {
  children: ReactNode;
  /** Max translation as fraction of half-width (default 0.3) */
  strength?: number;
  /** Scale on hover (default 1 = no scale). Use 1.04–1.08 for buttons. */
  hoverScale?: number;
}

const SPRING = { stiffness: 250, damping: 22, mass: 0.4 };

export function Magnetic({
  children,
  strength = 0.3,
  hoverScale = 1,
}: MagneticProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  // Springs decouple input (raw deltas) from output (smoothed pixels).
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const scale = useSpring(1, SPRING);

  if (reduceMotion) return <>{children}</>;

  function handleMove(e: PointerEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
    scale.set(1);
  }

  function handleEnter() {
    if (hoverScale !== 1) scale.set(hoverScale);
  }

  return (
    <motion.span
      ref={ref}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      style={{ x, y, scale, display: "inline-block" }}
      // `willChange: transform` hint — sticks the layer on the GPU during
      // the magnetic interaction so we don't repaint on every pointer move.
      className="will-change-transform"
    >
      {children}
    </motion.span>
  );
}
