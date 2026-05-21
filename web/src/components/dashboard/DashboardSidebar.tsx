// ============================================================================
// DashboardSidebar.tsx — Role-aware sidebar (LMS orange theme)
// ============================================================================
// Reads live user from CurrentUserProvider; falls back to server-passed prop
// for SSR initial paint. Profile dropdown bottom-anchored (Claude-style).
// ============================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronsUpDown,
  LifeBuoy,
  Sparkles,
  GraduationCap,
  PlaySquare,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import type { AuthUser, Role } from "@/lib/helpers/auth-helpers";
import { cn, getInitials } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

// ─── Role-based nav configs ──────────────────────────────────
const studentNav: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Courses", url: "/dashboard/my-courses", icon: PlaySquare },
  { title: "Browse", url: "/dashboard/browse", icon: BookOpen },
  { title: "Certificates", url: "/dashboard/certificates", icon: Award },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
];

const instructorNav: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Courses", url: "/dashboard/courses", icon: BookOpen },
  { title: "Students", url: "/dashboard/students", icon: Users },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Payouts", url: "/dashboard/payouts", icon: CreditCard },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
];

const adminNav: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Courses", url: "/dashboard/courses", icon: BookOpen },
  { title: "Users", url: "/dashboard/users", icon: Users },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Certificates", url: "/dashboard/certificates", icon: Award },
  { title: "Payments", url: "/dashboard/payments", icon: CreditCard },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
];

function getNavForRole(role: Role): NavItem[] {
  switch (role) {
    case "ADMIN":
      return adminNav;
    case "INSTRUCTOR":
      return instructorNav;
    case "STUDENT":
    default:
      return studentNav;
  }
}

// ─── Helpers ─────────────────────────────────────────────────
// function getInitials(name: string | undefined, email: string | undefined) {
//   if (name) {
//     return name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   }
//   return email?.[0]?.toUpperCase() ?? "U";
// }

// ============================================================================
// DashboardSidebar
// ============================================================================
interface DashboardSidebarProps {
  user: AuthUser;
}

export function DashboardSidebar({
  user: fallbackUser,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Live user — falls back to SSR-passed user if provider not yet hydrated
  const liveUser = useCurrentUser() ?? fallbackUser;
  const role = liveUser.role;
  const navItems = getNavForRole(role);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out");
          router.push("/sign-in");
          router.refresh();
        },
      },
    });
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[rgba(255,90,31,0.08)] bg-[#0A0807]"
    >
      {/* ── Header — Brand ── */}
      <SidebarHeader className="pt-4">
        <div className="flex items-center gap-2 pl-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
          <Link
            href="/"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-lg shadow-[rgba(224,74,18,0.4)]"
            style={{
              background: "linear-gradient(135deg,#FF5A1F,#E04A12)",
            }}
            aria-label="LMS home"
          >
            <GraduationCap className="size-4 text-white" />
          </Link>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p
              className="truncate text-sm font-bold tracking-tight leading-none"
              style={{
                background:
                  "linear-gradient(135deg, #fff 0%, #FFF7EC 60%, #FFB07A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              LMS
            </p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[2.5px] text-[#FF5A1F]">
              Learn · Build · Grow
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-0 bg-[rgba(255,90,31,0.08)]" />

      {/* ── Main nav ── */}
      <SidebarContent className="gap-0 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-medium uppercase tracking-widest text-white/35">
            {role === "ADMIN"
              ? "Administration"
              : role === "INSTRUCTOR"
                ? "Teaching"
                : "Learning"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.url === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-9 px-3 py-2 text-[13px] font-medium tracking-tight transition-all",
                        "hover:bg-[rgba(255,90,31,0.08)] hover:text-[#FFB07A]",
                        "data-[active=true]:border data-[active=true]:border-[rgba(255,90,31,0.25)] data-[active=true]:bg-[rgba(255,90,31,0.1)] data-[active=true]:text-[#FFB07A]",
                      )}
                    >
                      <Link href={item.url} prefetch>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer — Profile dropdown ── */}
      <SidebarFooter className="mt-auto border-t border-[rgba(255,90,31,0.08)] px-2 py-3 group-data-[collapsible=icon]:px-1.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <ProfileDropdown user={liveUser} onSignOut={handleSignOut} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail className="after:bg-[rgba(255,90,31,0.05)] hover:after:bg-[rgba(255,90,31,0.15)]" />
    </Sidebar>
  );
}

// ============================================================================
// ProfileDropdown — Claude-style bottom card
// ============================================================================
function ProfileDropdown({
  user,
  onSignOut,
}: {
  user: AuthUser;
  onSignOut: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const initials = getInitials(user.name);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group/profile relative flex w-full items-center gap-2.5 rounded-xl border border-[rgba(255,90,31,0.15)] bg-[rgba(255,90,31,0.05)]",
            "px-2.5 py-2 text-left transition-all duration-200",
            "hover:border-[rgba(255,90,31,0.3)] hover:bg-[rgba(255,90,31,0.1)]",
            "data-[state=open]:border-[rgba(255,90,31,0.4)] data-[state=open]:bg-[rgba(255,90,31,0.12)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/50",
            "group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:w-8",
            "group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0",
            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg",
            "group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent",
            "group-data-[collapsible=icon]:mx-auto",
          )}
        >
          <Avatar className="size-7 rounded-lg ring-1 ring-[rgba(255,90,31,0.3)]">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name ?? "User"} />
            ) : null}
            <AvatarFallback
              className="rounded-lg text-[11px] font-bold text-white"
              style={{
                background: "linear-gradient(135deg,#FF5A1F,#E04A12)",
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-semibold leading-none text-[#FFB07A]">
              {user.name ?? "User"}
            </p>
            <p className="mt-1 truncate text-[10px] capitalize text-white/45">
              {user.role.toLowerCase()}
            </p>
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="ml-auto shrink-0 text-white/40 group-hover/profile:text-white/70 group-data-[collapsible=icon]:hidden"
          >
            <ChevronsUpDown className="size-3.5" />
          </motion.span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="top"
        sideOffset={10}
        className="w-64 rounded-2xl"
      >
        {/* Identity header */}
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar className="size-8 rounded-lg">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name ?? "User"} />
            ) : null}
            <AvatarFallback
              className="rounded-lg text-[12px] font-bold text-white"
              style={{
                background: "linear-gradient(135deg,#FF5A1F,#E04A12)",
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-tight">
              {user.name ?? "User"}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/profile"
              className="flex cursor-pointer items-center gap-2"
            >
              <Sparkles className="size-4 text-muted-foreground" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/settings"
              className="flex cursor-pointer items-center gap-2"
            >
              <Settings className="size-4 text-muted-foreground" />
              <span>Settings</span>
              <DropdownMenuShortcut>⇧⌘,</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" asChild>
            <Link href="/help">
              <LifeBuoy className="size-4 text-muted-foreground" />
              <span>Get help</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            void onSignOut();
          }}
          className="gap-2 text-rose-400 focus:text-rose-300"
        >
          <LogOut className="size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
