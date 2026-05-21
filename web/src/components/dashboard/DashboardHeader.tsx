// ============================================================================
// DashboardHeader.tsx — Sidebar trigger + greeting + quick actions
// ============================================================================
// Reads from CurrentUserProvider — same name on SSR + client = no hydration
// mismatch on the greeting.
// ============================================================================

"use client";

import Link from "next/link";
import { Bell, HelpCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export function DashboardHeader() {
  const user = useCurrentUser();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <header className="flex items-center justify-between border-b border-[rgba(255,90,31,0.08)] bg-[rgba(15,10,7,0.6)] backdrop-blur-xl px-4 py-2.5 lg:px-6">
      {/* Left — Sidebar trigger + greeting */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 size-7 hover:bg-[rgba(255,90,31,0.1)] hover:text-[#FFB07A]" />
        <div className="space-y-0.5">
          <p className="text-[11px] text-white/45">Welcome back</p>
          <h1 className="text-sm font-semibold tracking-tight text-white">
            {firstName} 👋
          </h1>
        </div>
      </div>

      {/* Right — Action icons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-white/65 hover:bg-[rgba(255,90,31,0.08)] hover:text-[#FFB07A]"
          asChild
        >
          <Link href="/dashboard/notifications" aria-label="Notifications">
            <Bell className="size-3.5" />
            <span className="hidden sm:inline text-xs">Inbox</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-white/65 hover:bg-[rgba(255,90,31,0.08)] hover:text-[#FFB07A]"
          asChild
        >
          <Link href="mailto:hello@lms.com" aria-label="Feedback">
            <MessageSquare className="size-3.5" />
            <span className="hidden lg:inline text-xs">Feedback</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-white/65 hover:bg-[rgba(255,90,31,0.08)] hover:text-[#FFB07A]"
          asChild
        >
          <Link href="/help" aria-label="Help">
            <HelpCircle className="size-3.5" />
            <span className="hidden lg:inline text-xs">Help</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
