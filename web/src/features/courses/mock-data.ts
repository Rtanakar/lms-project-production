// ============================================================================
// mock-data.ts — Sample courses for development (replaced by API later)
// ============================================================================
// Production me ye file delete ho jaayegi — useCourses() hook backend API se
// fetch karega. Abhi marketing page UX develop karne ke liye realistic data.
// ============================================================================

import type { CourseDetail, CourseSummary } from "./types";

// Cover image — gradient strings (no external CDN dependency in dev)
const gradient = (a: string, b: string, c: string) =>
  `linear-gradient(135deg, ${a} 0%, ${b} 50%, ${c} 100%)`;

export const MOCK_COURSES: CourseSummary[] = [
  {
    id: "c_3.0",
    slug: "job-ready-ai-cohort-3",
    title: "3.0 Job Ready AI Powered Cohort",
    subtitle: "Build production-grade apps with AI workflows",
    coverImage: gradient("#10B981", "#065F46", "#022C22"),
    status: "LIVE",
    tags: [
      { label: "Product Building", tone: "accent" },
      { label: "Community Access" },
      { label: "Gamified Learning" },
    ],
    price: 7999,
    originalPrice: 15998,
    discountPercent: 50,
    level: "Intermediate",
    durationHours: 220,
    studentsEnrolled: 12480,
    rating: 4.9,
  },
  {
    id: "c_ds_analytics",
    slug: "data-science-analytics-with-genai",
    title: "Data Science and Analytics with GenAI",
    subtitle: "Pandas, ML, dashboards, and GenAI integration",
    coverImage: gradient("#F59E0B", "#B45309", "#451A03"),
    status: "LIVE",
    tags: [
      { label: "Machine Learning", tone: "accent" },
      { label: "Deep Learning" },
      { label: "Gen-AI", tone: "success" },
    ],
    price: 6999,
    originalPrice: 14891,
    discountPercent: 53,
    level: "Intermediate",
    durationHours: 180,
    studentsEnrolled: 8210,
    rating: 4.8,
  },
  {
    id: "c_2.0",
    slug: "job-ready-ai-cohort-2",
    title: "2.0 Job Ready AI Powered Cohort",
    subtitle: "MERN + DSA + AI integration — the classic path",
    coverImage: gradient("#3B82F6", "#1E40AF", "#1E1B4B"),
    status: "LIVE",
    tags: [
      { label: "Job Ready", tone: "accent" },
      { label: "MERN Stack" },
      { label: "DSA With JS" },
    ],
    price: 5999,
    originalPrice: 11998,
    discountPercent: 50,
    level: "Beginner",
    durationHours: 200,
    studentsEnrolled: 18920,
    rating: 4.9,
  },
  {
    id: "c_devops",
    slug: "production-devops-mastery",
    title: "Production DevOps Mastery",
    subtitle: "Docker, K8s, CI/CD, AWS, observability",
    coverImage: gradient("#A855F7", "#6B21A8", "#2E1065"),
    status: "UPCOMING",
    tags: [
      { label: "Docker" },
      { label: "Kubernetes", tone: "accent" },
      { label: "AWS" },
    ],
    price: 8999,
    originalPrice: 17998,
    discountPercent: 50,
    level: "Advanced",
    durationHours: 140,
    studentsEnrolled: 3210,
    rating: 4.7,
  },
  {
    id: "c_sysd",
    slug: "system-design-from-scratch",
    title: "System Design from Scratch",
    subtitle: "Design Twitter, Netflix, Uber — interview-ready",
    coverImage: gradient("#EC4899", "#9F1239", "#4C0519"),
    status: "LIVE",
    tags: [
      { label: "System Design", tone: "accent" },
      { label: "Architecture" },
      { label: "Interview Prep" },
    ],
    price: 6499,
    originalPrice: 12999,
    discountPercent: 50,
    level: "Advanced",
    durationHours: 95,
    studentsEnrolled: 5640,
    rating: 4.9,
  },
  {
    id: "c_typescript",
    slug: "typescript-deep-dive",
    title: "TypeScript Deep Dive",
    subtitle: "From basics to advanced generics + runtime validation",
    coverImage: gradient("#06B6D4", "#0E7490", "#083344"),
    status: "COMPLETED",
    tags: [
      { label: "TypeScript", tone: "accent" },
      { label: "Zod" },
      { label: "Advanced Generics" },
    ],
    price: 3999,
    originalPrice: 7999,
    discountPercent: 50,
    level: "Intermediate",
    durationHours: 60,
    studentsEnrolled: 9320,
    rating: 4.8,
  },
];

// Helper — find by slug (mock detail page)
export function getMockCourseBySlug(slug: string): CourseDetail | null {
  const summary = MOCK_COURSES.find((c) => c.slug === slug);
  if (!summary) return null;
  // Stub detail data — Sub-step B me proper fill karenge
  return {
    ...summary,
    description: "Course description placeholder — full detail in next sub-step.",
    whatYouLearn: [],
    prerequisites: [],
    modules: [],
    instructor: {
      id: "i_default",
      name: "Ratnakar Mishra",
      title: "Lead Instructor",
      avatar: "",
    },
    faqs: [],
    testimonials: [],
  };
}
