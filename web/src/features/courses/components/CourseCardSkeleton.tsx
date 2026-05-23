// ============================================================================
// CourseCardSkeleton.tsx — placeholder card matching CourseProductCard layout
// ============================================================================
// Layout mirrors the real card so the grid doesn't shift when results land:
//   image (16:10) → tags row → title (2 lines) → subtitle → price + CTA row
//
// `variant` toggles the footer block — pre-purchase (price + button) vs
// progress (chapters + bar + continue button). Marketing pages pass the
// right variant so the skeleton matches the eventual UI.
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

interface CourseCardSkeletonProps {
  variant?: "price" | "progress";
}

export function CourseCardSkeleton({
  variant = "price",
}: CourseCardSkeletonProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[rgba(255,90,31,0.1)] bg-[rgba(15,10,7,0.55)]">
      <Skeleton className="aspect-16/10 w-full rounded-none bg-[rgba(255,90,31,0.06)]" />

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Tags */}
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full bg-[rgba(255,90,31,0.06)]" />
          <Skeleton className="h-5 w-20 rounded-full bg-[rgba(255,90,31,0.06)]" />
        </div>

        {/* Title — 2 lines */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-[90%] bg-[rgba(255,90,31,0.06)]" />
          <Skeleton className="h-5 w-[65%] bg-[rgba(255,90,31,0.06)]" />
        </div>

        {/* Subtitle */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-full bg-[rgba(255,90,31,0.06)]" />
          <Skeleton className="h-3.5 w-[80%] bg-[rgba(255,90,31,0.06)]" />
        </div>

        {/* Footer */}
        <div className="mt-auto space-y-3 border-t border-[rgba(255,90,31,0.08)] pt-4">
          {variant === "price" ? (
            <>
              <Skeleton className="h-7 w-28 bg-[rgba(255,90,31,0.06)]" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-20 bg-[rgba(255,90,31,0.06)]" />
                <Skeleton className="h-9 w-32 rounded-md bg-[rgba(255,90,31,0.06)]" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-20 bg-[rgba(255,90,31,0.06)]" />
                <Skeleton className="h-3.5 w-24 bg-[rgba(255,90,31,0.06)]" />
              </div>
              <Skeleton className="h-2 w-full rounded-full bg-[rgba(255,90,31,0.06)]" />
              <Skeleton className="h-9 w-full rounded-md bg-[rgba(255,90,31,0.06)]" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
