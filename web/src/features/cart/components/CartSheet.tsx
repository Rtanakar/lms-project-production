// ============================================================================
// CartSheet.tsx — Slide-in cart sidebar (shadcn Sheet)
// ============================================================================
// Industry pattern (Stripe / Amazon / Udemy):
//   • Trigger lives in the top nav (icon + count badge)
//   • Sheet slides from the right, ~420-520px wide
//   • Header pinned, item list scrolls, footer (subtotal + CTA) pinned
//   • Empty state with friendly CTA so first-time visitors aren't lost
//
// Hydration note:
//   Zustand `persist` writes to localStorage on the client. On SSR the cart
//   is empty by default; on first client render `persist` hydrates from
//   storage and items appear. To avoid a hydration-mismatch flash on the
//   badge count, the BUTTON renders count only post-mount (see CartButton).
// ============================================================================

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useCartCount,
  useCartItems,
  useCartOriginalTotal,
  useCartStore,
  useCartSubtotal,
  type CartItem,
} from "../store/cart-store";

// ============================================================================
// Currency formatter
// ============================================================================
function fmt(amount: number, currency = "INR") {
  if (currency === "INR") return `₹${amount.toLocaleString("en-IN")}`;
  return `${currency} ${amount.toLocaleString()}`;
}

// ============================================================================
// Cart row — one item with thumbnail, title, price, remove
// ============================================================================
function CartRow({ item }: { item: CartItem }) {
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 rounded-xl border border-[rgba(255,90,31,0.1)] bg-[rgba(20,12,8,0.5)] p-3"
    >
      {/* Thumbnail */}
      <Link
        href={`/courses/${item.slug}`}
        className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-[rgba(255,90,31,0.1)] bg-[rgba(255,90,31,0.05)]"
      >
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="size-5 text-white/30" />
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/courses/${item.slug}`}
          className="truncate text-sm font-semibold text-white/90 hover:text-[#FFB07A]"
        >
          {item.title}
        </Link>
        {item.subtitle && (
          <p className="line-clamp-1 text-[11px] text-white/45">
            {item.subtitle}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-[#FFB07A]">
              {fmt(item.price, item.currency)}
            </span>
            {item.originalPrice > item.price && (
              <span className="text-[11px] text-white/35 line-through">
                {fmt(item.originalPrice, item.currency)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.courseId)}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-rose-300/80 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
            aria-label={`Remove ${item.title} from cart`}
          >
            <Trash2 className="size-3" />
            Remove
          </button>
        </div>
      </div>
    </motion.li>
  );
}

// ============================================================================
// Empty state
// ============================================================================
function EmptyCart() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[rgba(255,90,31,0.1)]">
        <ShoppingBag className="size-7 text-[#FFB07A]" />
      </div>
      <p className="font-semibold text-white/85">Your cart is empty</p>
      <p className="mt-1 max-w-xs text-sm text-white/50">
        Browse our courses and add the ones you want to start learning.
      </p>
      <Button
        asChild
        className="mt-5 shadow-lg shadow-[rgba(224,74,18,0.3)]"
        style={{ background: "linear-gradient(135deg,#FF5A1F,#E04A12)" }}
      >
        <Link href="/courses">Explore courses</Link>
      </Button>
    </div>
  );
}

// ============================================================================
// CartSheet — owns Sheet open/close via `trigger` prop slot
// ============================================================================
// Trigger is passed as children so callers (TopNav, anywhere) can compose
// their own button look. The Sheet wires open state internally via Radix —
// no need for controlled state from the parent.
// ============================================================================
export function CartSheet({ trigger }: { trigger: React.ReactNode }) {
  const items = useCartItems();
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const originalTotal = useCartOriginalTotal();
  const savings = originalTotal - subtotal;
  const clear = useCartStore((s) => s.clear);

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-[rgba(255,90,31,0.15)] bg-[rgba(10,8,7,0.97)] backdrop-blur-xl sm:max-w-md"
      >
        <SheetHeader className="border-b border-[rgba(255,90,31,0.1)] px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-white/95">
            <ShoppingBag className="size-4 text-[#FFB07A]" />
            Your cart
            {count > 0 && (
              <span className="rounded-full bg-[rgba(255,90,31,0.15)] px-2 py-0.5 text-xs font-medium text-[#FFB07A]">
                {count}
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="text-xs text-white/50">
            {count === 0
              ? "Nothing here yet."
              : `${count} course${count === 1 ? "" : "s"} ready to enroll.`}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable items list */}
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item) => (
                <CartRow key={item.courseId} item={item} />
              ))}
            </AnimatePresence>
          </ul>
        )}

        {/* Footer — only when items exist */}
        {items.length > 0 && (
          <SheetFooter className="border-t border-[rgba(255,90,31,0.1)] px-5 py-4">
            <div className="w-full space-y-3">
              {/* Totals */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/55">Subtotal</span>
                  <span className="font-semibold text-white/90 tabular-nums">
                    {fmt(subtotal)}
                  </span>
                </div>
                {savings > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400/80">You save</span>
                    <span className="font-medium text-emerald-300 tabular-nums">
                      −{fmt(savings)}
                    </span>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="text-xs text-white/55 hover:bg-white/5 hover:text-rose-300"
                >
                  Clear
                </Button>
                <Button
                  className="flex-1 gap-2 shadow-lg shadow-[rgba(224,74,18,0.35)]"
                  style={{
                    background: "linear-gradient(135deg,#FF5A1F,#E04A12)",
                  }}
                  asChild
                >
                  <Link href="/checkout">Checkout · {fmt(subtotal)}</Link>
                </Button>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
