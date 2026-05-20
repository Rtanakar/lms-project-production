// ============================================================================
// types.ts — Course domain types
// ============================================================================
// Yahi types backend Prisma model ke saath sync rahenge (later when API ready).
// Abhi mock data ke saath use ho rahe — TypeScript types stable rakhna important.
// ============================================================================

export type CourseStatus = "LIVE" | "UPCOMING" | "COMPLETED";

export interface CourseInstructor {
  id: string;
  name: string;
  title: string; // e.g. "Lead Engineer @ Vercel"
  avatar: string;
  bio?: string;
}

export interface CourseTag {
  label: string;
  // Optional accent color for chip — defaults to brand
  tone?: "default" | "accent" | "success";
}

export interface CourseLesson {
  id: string;
  title: string;
  durationMin: number;
  isFree?: boolean; // Preview lessons
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  lessons: CourseLesson[];
}

export interface CourseSummary {
  /** URL slug — used in /courses/[slug] */
  slug: string;
  id: string;
  title: string;
  subtitle?: string;
  coverImage: string; // URL — for mock, gradient string is OK
  /** Status badge — "LIVE" shows red pulsing chip on card */
  status: CourseStatus;
  tags: CourseTag[];
  /** INR price (paise NAHI — display rupees as integer) */
  price: number;
  /** Original price before discount — for strike-through */
  originalPrice: number;
  /** Auto-computed discountPercent from price/originalPrice */
  discountPercent: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  durationHours: number;
  studentsEnrolled: number;
  rating: number; // 0–5
}

export interface CourseDetail extends CourseSummary {
  description: string;
  whatYouLearn: string[];
  prerequisites: string[];
  modules: CourseModule[];
  instructor: CourseInstructor;
  /** FAQ specific to this course */
  faqs: { question: string; answer: string }[];
  /** Sample testimonials */
  testimonials: {
    name: string;
    role: string;
    avatar: string;
    quote: string;
    rating: number;
  }[];
}
