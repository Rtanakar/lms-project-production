// ============================================================================
// SectionHeading.tsx — Reusable "CHIP + Big Title" section header
// ============================================================================
// Sheryians-style — Every section uses the orange-tinted chip above the
// section title. Centralize karke consistent typography rakhte hain.
// ============================================================================

"use client";

import { motion } from "motion/react";

interface SectionHeadingProps {
  chip: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}

export default function SectionHeading({
  chip,
  title,
  subtitle,
  align = "center",
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className={align === "center" ? "text-center" : "text-left"}
    >
      <span
        className="inline-block rounded border border-[rgba(255,90,31,0.25)] bg-[rgba(255,90,31,0.06)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[2.5px]"
        style={{ color: "#FFB07A" }}
      >
        {chip}
      </span>

      <h2
        className="mt-5 text-[34px] font-bold leading-[1.15] tracking-tight sm:text-[44px] md:text-[52px]"
        style={{
          background:
            "linear-gradient(135deg, #fff 0%, #FFF7EC 55%, #FFB07A 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={`mt-4 text-base leading-relaxed text-white/55 sm:text-lg ${
            align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
