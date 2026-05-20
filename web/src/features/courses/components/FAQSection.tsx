// ============================================================================
// FAQSection.tsx — Accordion FAQ
// ============================================================================
// Industry pattern: native <details>/<summary> with motion for height animate.
// No accessibility issues — keyboard + screen reader work natively.
// ============================================================================

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import SectionHeading from "@/components/marketing/SectionHeading";

const FAQS = [
  {
    q: "Are these courses suitable for beginners?",
    a: "Absolutely. Each course indicates its level — Beginner, Intermediate, or Advanced. We have foundational paths for absolute beginners and advanced cohorts for experienced developers.",
  },
  {
    q: "Does LMS provide placement assistance?",
    a: "Yes — our job-ready cohorts include resume review, mock interviews, project portfolio guidance, and partner-company referrals.",
  },
  {
    q: "What programming languages and technologies are covered?",
    a: "Full-stack JavaScript/TypeScript (React, Next.js, Node, Express), Python (Django, FastAPI, ML), DevOps (Docker, K8s, AWS), DSA, System Design, and more — see individual course curriculums.",
  },
  {
    q: "Are the classes live or pre-recorded? Can I rewatch?",
    a: "Our cohorts feature live sessions plus recorded backups available in the dashboard. You can access recordings any time during your enrollment period.",
  },
  {
    q: "Do students get real-world project experience?",
    a: "Yes — every cohort requires building 5–10 production-grade projects. Some learners ship to real users and add to their portfolio for job interviews.",
  },
  {
    q: "What is the refund policy?",
    a: "Full refund available within 7 days of course start. After that, partial refunds depend on the course progress — see our refund policy page for details.",
  },
];

export default function FAQSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          chip="FAQS"
          title={
            <>
              Frequently asked
              <br />
              questions from learners
            </>
          }
        />

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, i) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="overflow-hidden rounded-xl border border-[rgba(255,90,31,0.12)] bg-[rgba(20,12,8,0.45)] backdrop-blur"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[rgba(255,90,31,0.04)]"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-white/90 sm:text-base">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-[#FF5A1F]"
        >
          <ChevronDown className="size-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-white/60">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
