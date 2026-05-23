// ============================================================================
// UserMenu.tsx — dropdown avatar trigger for SiteHeader right cluster
// ============================================================================
// Three states:
//   • pending  → skeleton chip (avoid first-paint layout shift)
//   • signed-in → avatar + name chip → dropdown with Dashboard / Profile /
//     My Courses / Sign out
//   • anon     → "Sign in" link (becomes the chip itself, no dropdown)
//
// Why a single dropdown vs separate icons?
//   Cleaner header surface area. The cart button is right next to this —
//   two icons + sign-in CTA would feel cluttered. Dropdown groups all
//   account actions behind one affordance.
// ============================================================================

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronDown, LayoutDashboard, LogOut, BookMarked, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserMenu() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) return <UserMenuSkeleton />;
  if (!session?.user) return <SignInChip />;

  const user = session.user;
  const displayName = user.name ?? "Account";
  // Dashboard link is staff-only — STUDENT has no dashboard.
  const isStaff =
    (user as { role?: string }).role === "ADMIN" ||
    (user as { role?: string }).role === "INSTRUCTOR";

  async function handleSignOut() {
    const promise = authClient.signOut().then(() => {
      router.refresh();
      router.push("/");
    });
    toast.promise(promise, {
      loading: "Signing out…",
      success: "See you soon 👋",
      error: "Could not sign out.",
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "group inline-flex items-center gap-2 rounded-full border border-[rgba(255,90,31,0.18)] bg-[rgba(20,12,8,0.55)] py-1 pl-1 pr-3",
              "transition-colors hover:border-[rgba(255,90,31,0.4)] hover:bg-[rgba(255,90,31,0.08)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/40",
            )}
          >
            <Avatar className="size-7">
              <AvatarImage src={user.image ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-[#FF5A1F] to-[#E04A12] text-[11px] font-bold text-white">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-32 truncate text-sm font-medium text-white/85 sm:inline-block">
              {displayName.split(" ")[0]}
            </span>
            <ChevronDown
              className="size-3.5 text-white/55 transition-transform group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-60 rounded-xl border-[rgba(255,90,31,0.15)] bg-[rgba(10,8,7,0.97)] backdrop-blur-xl"
        >
          <DropdownMenuLabel className="flex items-center gap-3 px-3 py-3">
            <Avatar className="size-9">
              <AvatarImage src={user.image ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-[#FF5A1F] to-[#E04A12] text-xs font-bold text-white">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white/95">
                {displayName}
              </p>
              <p className="truncate text-xs text-white/55">{user.email}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-[rgba(255,90,31,0.1)]" />

          {isStaff && (
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard"
                className="flex cursor-pointer items-center gap-2"
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link
              href="/my-courses"
              className="flex cursor-pointer items-center gap-2"
            >
              <BookMarked className="size-4" />
              My Courses
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/profile"
              className="flex cursor-pointer items-center gap-2"
            >
              <UserIcon className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-[rgba(255,90,31,0.1)]" />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="flex cursor-pointer items-center gap-2 text-rose-300 focus:bg-rose-500/10 focus:text-rose-300"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

// ─── Skeleton chip ─────────────────────────────────────────────────────────
function UserMenuSkeleton() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,90,31,0.12)] bg-[rgba(20,12,8,0.55)] py-1 pl-1 pr-3">
      <Skeleton className="size-7 shrink-0 rounded-full bg-[rgba(255,90,31,0.08)]" />
      <Skeleton className="hidden h-3 w-16 rounded bg-[rgba(255,90,31,0.08)] sm:block" />
      <ChevronDown className="size-3.5 text-white/25" />
    </div>
  );
}

// ─── Anonymous CTA chip ────────────────────────────────────────────────────
function SignInChip() {
  return (
    <Link
      href="/sign-in"
      className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-white shadow-lg shadow-[rgba(224,74,18,0.35)] transition-all hover:brightness-110"
      style={{ background: "linear-gradient(135deg,#FF5A1F,#E04A12)" }}
    >
      Sign in
    </Link>
  );
}
