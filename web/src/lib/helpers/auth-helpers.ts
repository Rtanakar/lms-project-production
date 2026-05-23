// ============================================================================
// auth-helpers.ts — Server-side session helpers (Next.js 16)
// ============================================================================
// Forward request cookies to backend's /api/auth/get-session.
// IMPORTANT: cookies() is ASYNC in Next.js 16.
// ============================================================================

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";

// Exported for use across the app (sidebar, header, profile dropdown, etc.)
export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

// Narrow type for components that ONLY render for dashboard users
// (ADMIN/INSTRUCTOR). The /dashboard layout gates STUDENT out, so any
// component below the layout can rely on this tighter contract.
export type StaffRole = "ADMIN" | "INSTRUCTOR";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  id: string;
  token: string;
  expiresAt: string;
  userId: string;
}

interface ServerSession {
  user: AuthUser;
  session: AuthSession;
}

export async function getServerSession(): Promise<ServerSession | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
      {
        method: "GET",
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      },
    );

    if (!res.ok) return null;
    const data = (await res.json()) as ServerSession | null;
    return data;
  } catch (err) {
    console.error("[auth-helpers] getServerSession failed:", err);
    return null;
  }
}

export async function requireAuth(): Promise<ServerSession> {
  const session = await getServerSession();
  if (!session?.user) redirect("/sign-in");
  return session;
}

// Role-aware landing — STUDENT has no dashboard, lands on /my-courses
// (marketing surface). ADMIN/INSTRUCTOR land on /dashboard.
export function homeForRole(role: Role): string {
  return role === "STUDENT" ? "/my-courses" : "/dashboard";
}

export async function requireUnauth(): Promise<void> {
  const session = await getServerSession();
  if (session?.user) redirect(homeForRole(session.user.role));
}

export async function requireRole(
  ...allowed: Role[]
): Promise<ServerSession> {
  const session = await requireAuth();
  if (!allowed.includes(session.user.role)) {
    redirect(homeForRole(session.user.role));
  }
  return session;
}
