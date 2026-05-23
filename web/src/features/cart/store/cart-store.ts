// ============================================================================
// cart-store.ts — Zustand store for shopping cart
// ============================================================================
// Why Zustand here (and not TanStack Query / Context)?
//
//   Cart is genuine *client-only* state:
//     • Survives navigation between routes (Context loses state on full nav)
//     • Survives reload (persist middleware → localStorage)
//     • Not on the server until checkout (TanStack Query is the wrong tool)
//     • Read by many disconnected components (TopNav badge, CartSheet,
//       CourseCard "in cart" indicator) → drilling refs through React tree
//       gets ugly fast
//
// Why Zustand, not Redux Toolkit?
//   • ~1KB bundle vs RTK ~12KB
//   • No reducers/actions/dispatchers boilerplate — store IS the API
//   • First-class React 19 + RSC story (no provider tree needed)
//   • Used by Linear, Vercel, Resend, Cal.com — modern default
//   • RTK still strong for huge enterprise apps that NEED time-travel
//     devtools + strict structure (Netflix legacy). For an LMS cart: overkill.
//
// Persistence strategy:
//   `persist` middleware → window.localStorage under key "lms-cart-v1".
//   Versioned key so future schema migrations don't blow up existing carts.
//   On server (SSR), localStorage is undefined — `persist` no-ops gracefully
//   and the cart hydrates on first client render.
// ============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ============================================================================
// Cart item — flat shape (no nested objects → cheap localStorage payload)
// ============================================================================
export interface CartItem {
  /** Course id from backend (cuid) — primary key for dedupe + remove */
  courseId: string;
  /** Slug for navigation links from the cart sheet */
  slug: string;
  title: string;
  subtitle?: string | null;
  /** Public R2 URL — same one MediaUploader / TipTap inserts */
  thumbnailUrl?: string | null;
  /** Discounted price (paid amount) */
  price: number;
  /** Original ("strike-through") price for display */
  originalPrice: number;
  currency: string;
  /** When the user added — for cart-aging UX later ("added 2h ago") */
  addedAt: number;
}

// ============================================================================
// Store shape
// ============================================================================
// State + actions colocated (Zustand convention). Selectors stay outside the
// `create` call so consumers can subscribe to slices instead of the whole
// store (prevents unnecessary re-renders).
// ============================================================================
interface CartState {
  items: CartItem[];

  // ─── Actions ────────────────────────────────────────────────────────────
  /** Add — idempotent. If courseId already present, no-op (cart is set-like). */
  addItem: (item: Omit<CartItem, "addedAt">) => void;
  removeItem: (courseId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          // Idempotent — re-adding the same course shouldn't duplicate
          if (state.items.some((i) => i.courseId === item.courseId)) {
            return state;
          }
          return {
            items: [...state.items, { ...item, addedAt: Date.now() }],
          };
        }),

      removeItem: (courseId) =>
        set((state) => ({
          items: state.items.filter((i) => i.courseId !== courseId),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "lms-cart-v1",
      storage: createJSONStorage(() => localStorage),
      // Only persist `items` — actions are functions (not serializable anyway,
      // but explicit allowlist prevents footguns when state grows).
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

// ============================================================================
// Selectors — subscribe to slices, not the whole store
// ============================================================================
// Each component picks ONLY what it cares about. TopNav badge re-renders on
// count change, never on item edits. CartSheet re-renders on items change,
// never on actions. This is the perf win Zustand gives you for free.
// ============================================================================
export const useCartCount = () => useCartStore((s) => s.items.length);

export const useCartItems = () => useCartStore((s) => s.items);

export const useCartSubtotal = () =>
  useCartStore((s) => s.items.reduce((sum, i) => sum + i.price, 0));

export const useCartOriginalTotal = () =>
  useCartStore((s) => s.items.reduce((sum, i) => sum + i.originalPrice, 0));

/** Returns a function — call with courseId to check membership. */
export const useIsInCart = () => {
  const items = useCartItems();
  return (courseId: string) => items.some((i) => i.courseId === courseId);
};
