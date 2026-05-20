// ============================================================================
// /courses — Marketing listing page
// ============================================================================
// Public page — no auth required. Mock data abhi, backend integration Phase
// 11.5C me karenge (Prisma Course model + GET /api/v1/courses).
// ============================================================================

import type { Metadata } from "next";
import TopNav from "@/components/marketing/TopNav";
import Footer from "@/components/marketing/Footer";
import SectionHeading from "@/components/marketing/SectionHeading";
import CoursesGrid from "@/features/courses/components/CoursesGrid";
import ComparisonSection from "@/features/courses/components/ComparisonSection";
import FAQSection from "@/features/courses/components/FAQSection";
import CTASection from "@/features/courses/components/CTASection";
import { MOCK_COURSES } from "@/features/courses/mock-data";

export const metadata: Metadata = {
  title: "Courses · LMS",
  description:
    "Level up your coding skills with expert-led courses. Production-grade, project-first learning.",
};

export default function CoursesPage() {
  return (
    <div className="relative min-h-screen bg-[#0A0807] text-white">
      {/* ─── Ambient background — subtle grid + glow ─── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,90,31,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,90,31,0.5) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center top, rgba(0,0,0,0.9) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 -top-40 h-150"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(255,90,31,0.15) 0%, rgba(224,74,18,0.04) 30%, transparent 65%)",
        }}
      />

      {/* ─── Top navigation ─── */}
      <TopNav />

      <main className="relative z-10">
        {/* ─── Hero / page heading ─── */}
        <section className="px-6 pt-20 pb-16 sm:pt-28">
          <div className="mx-auto max-w-5xl">
            <SectionHeading
              chip="Courses"
              title={
                <>
                  Level up your coding skills
                  <br />
                  with <span className="text-[#FF5A1F]">expert-led</span>{" "}
                  courses
                </>
              }
              subtitle="Industry-relevant cohorts taught by working engineers. Build real products, not toy demos."
            />
          </div>
        </section>

        {/* ─── Course grid ─── */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-6xl">
            <CoursesGrid courses={MOCK_COURSES} />
          </div>
        </section>

        {/* ─── Why us ─── */}
        <ComparisonSection />

        {/* ─── FAQ ─── */}
        <FAQSection />

        {/* ─── Bottom CTA ─── */}
        <CTASection />

        {/* ─── Footer with cursor-reveal wordmark ─── */}
        <Footer />
      </main>
    </div>
  );
}
