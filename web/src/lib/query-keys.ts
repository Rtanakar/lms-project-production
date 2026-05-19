// ============================================================================
// query-keys.ts — Centralized TanStack Query key factory
// ============================================================================
// Industry pattern: query keys ek jagah define karte hain ek factory ke
// through. Benefits:
//   - Typo se bachte hain (key mismatch = ghost cache)
//   - Invalidation easy: queryClient.invalidateQueries({ queryKey: qk.user.all })
//   - Hierarchical structure — parent key invalidate karo to all children
//
// Pattern: `qk.<feature>.<scope>(args)` — every level returns a readonly tuple
// ============================================================================

export const qk = {
  // Auth/User
  auth: {
    me: ["auth", "me"] as const,
    session: ["auth", "session"] as const,
  },

  // User (profile)
  user: {
    all: ["user"] as const,
    byId: (id: string) => ["user", id] as const,
  },

  // Future: courses, lessons, etc.
  course: {
    all: ["course"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["course", "list", filters ?? {}] as const,
    byId: (id: string) => ["course", id] as const,
  },

  enrollment: {
    mine: ["enrollment", "mine"] as const,
    byCourse: (courseId: string) => ["enrollment", "course", courseId] as const,
  },
} as const;
