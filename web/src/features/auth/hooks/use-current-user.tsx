// ============================================================================
// use-current-user.tsx — Client-side current user provider + hook
// ============================================================================
// Server layout fetches the session, seeds this provider. Client components
// then read/update via `useCurrentUser()` + `applyCurrentUserPatch()`.
//
// Why this instead of useSession() everywhere?
//   - Avoid waterfalls: SSR already has user — re-fetching on mount is wasteful
//   - Optimistic mutations: profile edit → patch context → UI updates instantly
//   - Zero hydration mismatch: same data on server + first client render
//
// Industry pattern (Vercel, Linear, Cal.com all use this exact pattern).
// ============================================================================

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/lib/helpers/auth-helpers";

interface CurrentUserContextValue {
  user: AuthUser | null;
  /** Optimistic update — call after a successful PATCH to local fields */
  patch: (changes: Partial<AuthUser>) => void;
  /** Hard replace — call after a full refetch */
  set: (user: AuthUser | null) => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

interface CurrentUserProviderProps {
  /** Server-seeded user (from getServerSession) */
  initial: AuthUser | null;
  children: ReactNode;
}

export function CurrentUserProvider({
  initial,
  children,
}: CurrentUserProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initial);

  const patch = useCallback((changes: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...changes } : prev));
  }, []);

  const value = useMemo(() => ({ user, patch, set: setUser }), [user, patch]);

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

/**
 * Read the current user from the provider.
 * Returns `null` if used outside dashboard (provider not mounted)
 * or if user is unauthenticated.
 */
export function useCurrentUser(): AuthUser | null {
  const ctx = useContext(CurrentUserContext);
  return ctx?.user ?? null;
}

/**
 * Get the patch function for optimistic local updates.
 * Throws if used outside the provider.
 */
export function useCurrentUserActions() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error(
      "useCurrentUserActions must be used inside <CurrentUserProvider>",
    );
  }
  return { patch: ctx.patch, set: ctx.set };
}
