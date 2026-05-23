// ============================================================================
// AnimatedMenuLink — hover-slide text reveal (Awwwards staple)
// ============================================================================
// Two stacked copies of the label inside an overflow-hidden box:
//   • Top copy slides UP on hover (out of view)
//   • Bottom copy (offset down) slides into the same slot
// Effect: text seems to "roll" upward into a refreshed copy with primary color.
//
// Works as either `<Link>` or `<button>` — `href` decides. Same API as a
// regular anchor; pass `onClick` to close menus from the consumer.
// ============================================================================

"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface AnimatedMenuLinkProps {
  label: string;
  href: string;
  onClick?: () => void;
  className?: string;
}

const EASE = [0.7, 0, 0.2, 1] as const;

export function AnimatedMenuLink({
  label,
  href,
  onClick,
  className,
}: AnimatedMenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative inline-block overflow-hidden align-bottom",
        className,
      )}
    >
      {/* Original label — slides up on hover */}
      <motion.span
        className="inline-block"
        initial={{ y: 0 }}
        whileHover={{ y: "-110%" }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        {label}
      </motion.span>

      {/* Replacement — sits one line below, slides into place. Absolute so
          the parent's layout height stays equal to one line of text. */}
      <motion.span
        aria-hidden
        className="absolute left-0 top-0 inline-block text-[#FFB07A]"
        initial={{ y: "110%" }}
        whileHover={{ y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        // Pointer events off so hover detection lives on the parent only.
        style={{ pointerEvents: "none" }}
      >
        {label}
      </motion.span>

      {/* `group-hover` on the parent triggers BOTH copies' whileHover.
          Motion's whileHover keys off the element itself; nesting under the
          group ensures uniform timing when wrapped in <Magnetic>. */}
      <span
        className="invisible block h-0 group-hover:[--trigger:1]"
        aria-hidden
      />
    </Link>
  );
}
