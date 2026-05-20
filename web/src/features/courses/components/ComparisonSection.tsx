// ============================================================================
// ComparisonSection.tsx — "What sets us apart" vs Others
// ============================================================================

"use client";

import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import SectionHeading from "@/components/marketing/SectionHeading";

const OURS = [
  "Affordable, no quality compromise",
  "Project-based, skill-first learning",
  "Continuously updated with industry trends",
  "Internal hackathons & challenges",
  "Industry-relevant, job-oriented curriculum",
];

const OTHERS = [
  "High fees with compromised quality",
  "Theory-centric, lecture-only learning",
  "Outdated, static curriculum",
  "No competitive learning environment",
  "Limited practical exposure",
];

export default function ComparisonSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          chip="Comparison"
          title={
            <>
              What sets <span className="text-[#FF5A1F]">LMS</span> apart
              <br />
              from other platforms
            </>
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-16 grid gap-6 md:grid-cols-2"
        >
          {/* Ours */}
          <div
            className="relative overflow-hidden rounded-3xl border border-emerald-500/30 p-8"
            style={{
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,95,70,0.02))",
              boxShadow: "0 0 40px -10px rgba(16,185,129,0.25) inset",
            }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg,#FF5A1F,#E04A12)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 10v6M2 10l10-5 10 5-10 5z"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">LMS</h3>
            </div>

            <ul className="space-y-4">
              {OURS.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/40">
                    <Check className="size-3 text-emerald-300" />
                  </span>
                  <span className="text-sm text-white/85">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Others */}
          <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-[rgba(20,12,8,0.4)] p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="6"
                    width="18"
                    height="13"
                    rx="2"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="1.6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white/70">Others</h3>
            </div>

            <ul className="space-y-4">
              {OTHERS.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-500/15 ring-1 ring-rose-500/30">
                    <X className="size-3 text-rose-300" />
                  </span>
                  <span className="text-sm text-white/55">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
