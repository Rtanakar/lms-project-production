// ============================================================================
// CTASection.tsx — Bottom call-to-action with floating bg cards
// ============================================================================
// Sheryians style: faint background showing course thumbnails (suggesting
// breadth), centered headline + CTA button.
// ============================================================================

"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { MOCK_COURSES } from "../mock-data";

export default function CTASection() {
  // Use first few course gradients as floating background cards
  const bgCards = MOCK_COURSES.slice(0, 8);

  return (
    <section className="relative overflow-hidden px-6 py-32">
      {/* ─── Floating background cards (blurred) ─── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{ filter: "blur(2px)" }}
      >
        {bgCards.map((c, i) => {
          // Pseudo-random positioning (deterministic per index)
          const positions = [
            { top: "8%", left: "12%", rotate: -8 },
            { top: "18%", left: "65%", rotate: 6 },
            { top: "45%", left: "5%", rotate: 12 },
            { top: "55%", left: "78%", rotate: -10 },
            { top: "78%", left: "22%", rotate: -5 },
            { top: "70%", left: "55%", rotate: 8 },
            { top: "25%", left: "40%", rotate: 4 },
            { top: "82%", left: "70%", rotate: -3 },
          ];
          const pos = positions[i] ?? positions[0];
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="absolute h-32 w-44 rounded-lg shadow-2xl"
              style={{
                top: pos!.top,
                left: pos!.left,
                background: c.coverImage,
                transform: `rotate(${pos!.rotate}deg)`,
              }}
            />
          );
        })}
      </div>

      {/* ─── Foreground content ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <h2
          className="text-[34px] font-bold leading-[1.15] tracking-tight sm:text-[44px] md:text-[52px]"
          style={{
            background:
              "linear-gradient(135deg, #fff 0%, #FFF7EC 60%, #FFB07A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Transform your learning journey
          <br />
          into a career breakthrough with{" "}
          <span
            className="inline-block rounded-lg px-3"
            style={{
              background: "linear-gradient(135deg, #FF5A1F, #E04A12)",
              WebkitBackgroundClip: "initial",
              WebkitTextFillColor: "white",
              color: "white",
            }}
          >
            LMS
          </span>
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-10"
        >
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(224,74,18,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[rgba(224,74,18,0.65)]"
            style={{
              background: "linear-gradient(135deg, #FF5A1F, #E04A12)",
            }}
          >
            Explore Courses
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
