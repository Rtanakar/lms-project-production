// ============================================================================
// CartButton.tsx — Header trigger with count badge
// ============================================================================
// Pattern (Amazon / Udemy / Stripe):
//   • Bag/cart icon with a circular badge in the top-right corner
//   • Count animates when items are added (motion spring scale)
//   • Hydration-safe — badge stays hidden until client mount so Zustand's
//     localStorage-restored count doesn't clash with the SSR-rendered 0
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { CartSheet } from "./CartSheet";
import { useCartCount } from "../store/cart-store";

export function CartButton({ className = "" }: { className?: string }) {
  const count = useCartCount();

  // ─── Hydration guard ───────────────────────────────────────────────────
  // Zustand `persist` reads localStorage on the client only. SSR renders
  // count=0, client first paint also 0, then hydration fires and count jumps
  // to the persisted value. Without this guard the badge would briefly
  // disagree with the server-rendered DOM (React hydration warning).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const showBadge = mounted && count > 0;

  return (
    <CartSheet
      trigger={
        <button
          type="button"
          aria-label={
            showBadge ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart"
          }
          className={
            "relative inline-flex size-9 items-center justify-center rounded-full border border-[rgba(255,90,31,0.18)] bg-[rgba(20,12,8,0.55)] text-white/85 transition-all hover:border-[rgba(255,90,31,0.4)] hover:bg-[rgba(255,90,31,0.08)] hover:text-white " +
            className
          }
        >
          <ShoppingBag className="size-4" />

          {/* Count badge — animated entry on first non-zero */}
          <AnimatePresence>
            {showBadge && (
              <motion.span
                key={count}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5A1F] px-1 text-[10px] font-bold leading-none text-white shadow-lg shadow-[rgba(224,74,18,0.6)]"
              >
                {count > 9 ? "9+" : count}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      }
    />
  );
}
