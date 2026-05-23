// ============================================================================
// /dashboard layout — server component
// ============================================================================
// Wraps authenticated app in:
//   - Auth check (returns UnauthorizedPage if no session — no redirect race)
//   - CurrentUserProvider (seeds client context from server data)
//   - SidebarProvider (cookie-persisted open/closed state)
//   - DashboardSidebar + DashboardHeader
//
// Next.js 16: cookies() async → await before reading.
// ============================================================================

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import UnauthorizedPage from "@/components/UnauthorizedPage";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CurrentUserProvider } from "@/features/auth/hooks/use-current-user";
import { getServerSession } from "@/lib/helpers/auth-helpers";

export const metadata: Metadata = {
  title: {
    template: "%s · LMS Dashboard",
    default: "Dashboard · LMS",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) return <UnauthorizedPage />;

  // STUDENTs don't have a dashboard — bounce to their marketing home.
  // Gate at layout (before any chrome renders) so child pages can safely
  // assume the user is ADMIN or INSTRUCTOR.
  if (user.role === "STUDENT") redirect("/my-courses");

  // Sidebar open state persists across reloads via cookie (shadcn convention)
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <CurrentUserProvider initial={user}>
      <SidebarProvider defaultOpen={defaultOpen} className="h-svh bg-[#0A0807]">
        <DashboardSidebar user={user} />

        <SidebarInset className="min-h-0 min-w-0 bg-[#0A0807]">
          <DashboardHeader />
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto text-white">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </CurrentUserProvider>
  );
}
