// ============================================================================
// use-course-params.tsx — Client hook to read/write the courses URL state
// ============================================================================
// Wraps nuqs' `useQueryStates` with our shared params definition.
// One hook = entire dashboard courses URL state in sync across components.
// ============================================================================

"use client";

import { useQueryStates } from "nuqs";
import { courseParams } from "../server/params-loader";

export function useCourseParams() {
  return useQueryStates(courseParams);
}
