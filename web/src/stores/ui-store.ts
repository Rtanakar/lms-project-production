// ============================================================================
// ui-store.ts — Global UI state (Zustand, NOT persisted)
// ============================================================================
// Cross-component UI bits that don't belong to a single feature folder:
//   • menuOpen — full-screen nav overlay (SiteHeader ⇄ NavOverlay)
//
// Why a tiny global slice for this?
//   The header trigger and the overlay are sibling components rendered by
//   different parents. Lifting state up via prop drilling would require a
//   shared ancestor far up the tree; Zustand sidesteps that with zero
//   provider noise. State stays in memory only — no persist (a menu open
//   across reloads is bad UX).
// ============================================================================

import { create } from "zustand";

interface UIState {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  menuOpen: false,
  setMenuOpen: (open) => set({ menuOpen: open }),
  toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen })),
}));
